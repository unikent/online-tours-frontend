/**
 * App controller.
 * Keeps track of state and routing for tours app.
 *
 */
define(
	[
		'backbone',
		'app/config',
		'app/collections/zones',
		'app/models/zone',
		'app/models/tour',
		'app/errors/zone_is_not_a_zone',
		'app/models/poi',
		'app/views/index',
		'app/views/zone_menu',
		'app/views/tour_menu',
		'app/views/main',
		'app/views/error_helper',
        'app/models/page',
        'app/views/pages_page',
		'app/views/list',
        'text!app/templates/header.html',
        'app/views/header/header',
        'app/views/header/menu',
        'app/views/header/audio_menu'

	],
	function(Backbone, config, ZoneCollection, ZoneModel, TourModel, ZoneIsNotAZoneError, POI, Index, ZoneMenu, TourMenu, Main, ErrorHelper, Page, PagesPage, ListPage, headerTemplate, Header, MainMenu, AudioMenu){
		return Backbone.Router.extend({
			// Pointer to root zones collection
			zones: null,
			// Pages
			pages: [],
			errorHelper : null,
			// Current page
			currentPage: 0,
			// Currently selected zone
			currentZone: null,
			// Currently selected tour
			currentTour: null,

			routes: {
				"campuses": "zoneMenu",
				"campuses/:zone_slug": "tourMenu",
				"map/:zone_slug": "showZone",
				"map/:zone_slug/list": "showList",
				"map/:zone_slug/poi": "showZone",
				"map/:zone_slug/:id": "showTour",
				"map/:zone_slug/:id/list": "showList",
				"map/:zone_slug/:id/poi": "showTour",
				"map/:zone_slug/:tour_id/poi/:id": "showPOI",
				"map/:zone_slug/poi/:id": "showPOI",


				"page/:id": "showPage",
				'*path': 'default',
			},
			/**
			 * Set up App
			 * Creates base collections, init's page and backbone history
			 */
			initialize: function(options){
				// Setup root zones collection
				this.zones = new ZoneCollection();

                headerTemplate =  _.template(headerTemplate);

                $('.viewport').prepend(headerTemplate({}));
                $header = $('.app-header').first();
                this.header = new Header({el: $header.find('header')});
                this.menu = new MainMenu({el: $header.find('section.main-menu'), showTourItem:true });
                this.audioMenu = new AudioMenu({el: $header.find('section.audio-menu') });


                // Create pages & start loading content
				this.initPages();
				this.errorHelper = new ErrorHelper({});

				// Boot history
				if (!Backbone.History.started) {
					Backbone.history.start({pushState: true, hashChange: true,  root: config.basePath });
				}

                this.listenTo(Backbone,'backToMenu',this.tourMenu);
                this.listenTo(Backbone,'backToMap',this.backToMap);
                this.listenTo(Backbone,'menu:toggle', this.toggleMenu);
                this.listenTo(Backbone,'audiomenu:toggle', this.toggleAudioMenu);

			},
			/**
			 * Init Pages
			 * Creates core app "pages" & attempts loads initial zones from API
			 */
			initPages: function(){
				var $this = this;

				// Make index in to a page
				this.pages.push(new Index({ el: $("div.index")[0] }));

				// Add "pages" to pages array
				this.pages.push(new ZoneMenu({ collection: $this.zones }));
				this.pages.push(new TourMenu({ collection: $this.zones }));
				// Build map page - we have to wait for google so this could be slow
				this.pages.push(new Main({ collection: $this.zones }));

				this.pages.push(new ListPage());

				this.pages.push(new PagesPage());

				// Listen to re-size (don't trigger resize till action is complete)
				var resizing;
				window.addEventListener("resize", function(){
					clearTimeout(resizing);
					resizing = setTimeout(function(){

						Backbone.trigger('app:resize');
						//re slide to page in order to correct offsets (as these are all relative to screen size)
						$this._slideToPage($this.currentPage);
					}, 200);
				});

				// Attempt to load zones on init
				this._loadZones();

			},

			// Default root - shows index/loading page
			default: function() {
				this._showPage(0);
			},

			// Menu: Lets user pick zone
			zoneMenu: function(){
				var $this = this;

				// Try to load zones (they should already exist)
				this._loadZones();

				this._showPage(1);
			},
			// Menu: Lets user pick tour/free walk around in selected zone
			tourMenu: function(zone_slug){

				if(typeof zone_slug ==='undefined'){
					zone_slug = this.currentZone.get('slug');
				}

				$this = this;

				// Ensure page data is ready
				this._getCurrentZone({
					success: function(zone){
						// Render this page
						$this.pages[2].render(zone);
						// Get current zone will trigger setZone if a new one is configured.
						// In additional it will kick of the map render function
						
						zone.retriveItemThen({
							// Check if POI has children (if not, attempt to reload)
							get: function(){ return (zone.getChildPOIs().length !== 0); }
						});

						zone.tours.retriveItemThen({
							// Check if if already have content for tours (if not, attempt to load them)
							get: function () {
								return zone.get('tours').length > 0 && zone.tours.first().contents.length > 0;
							}
						});

						// todo: load tour contents as well as the contents for root POI

					},
					slug: zone_slug,
					// Ensure lookup happens even if zone is already selected as we may have just changed it
					force: true 
				});
				
				// Try to load page (will wait for data)
				this._showPage(2, 
					function(id){
						// @todo show loader
						console.log("waiting..");
					}
				);
				$this.navigate('/campuses/'+ zone_slug,false);

			},


			// Map: Displays map on zone with tour/content data overlayed
			showMap: function(zone_slug, auto_show_content){
				var $this = this;

				// Attempt to show page
				this._showPage(3);
				
				// Attempt to get data (if its missing)
				this._getCurrentZone({
					success: function(zone){

						zone.retriveItemThen({
							// Check if POI has children (if not, attempt to reload)
							get: function(){ return (zone.getChildPOIs().length !== 0); },
							success: function(){

								// & inital content
								if(typeof auto_show_content === 'undefined' || auto_show_content === null || auto_show_content === true){
									// render first page
									var poi = zone.pois.first();
									poi.fetch({
										success: function (argument) {
											$this.pages[3].renderContent(poi);
										},
										error: function () {
											$this.pages[3].renderContent(poi); // errors will be handled in content draw
										}
									});
								}
								// POI must be being loaded from else where, so leave it be.
							},
							error: function(){
								// Go to prev page a trigger an error
								$this.navigate('/campuses/'+zone_slug,  true );
								$this.errorHelper.createError("critical");
							}
						});
					},
					slug: zone_slug
				});

				$this.pages[3].subViews.map.resetGeolocation();

			},

			//UNTESTED
			showZone: function(zone_slug){
				$this = this;

				this._exitCurrentTour();

				this._getCurrentZone({
					slug: zone_slug,
					success: function (zone) {
						$this.pages[3].resetMap();
						$this.showMap(zone_slug, true);
						$this.navigate('/map/'+ zone_slug, {trigger:false, replace:true});
					}
				});
				
			},

			//UNTESTED
			showTour: function(zone_slug, tour_id){

				$this = this;
				var tour = new TourModel({id:tour_id});

				this._getCurrentZone({
					slug: zone_slug,
					success: function (zone) {
						$this._setCurrentTour(tour, zone, true);
						$this.showMap(zone_slug, false);
						$this.navigate('/map/'+ zone_slug + "/" + tour_id ,false);
					}
				});
				
			},

			showPage: function(page_id){
				var $this = this;

				this._showPage(5,
					function(id){

					}
				);

				// grab Page & load its contents
				var page = new Page({id: page_id});
				page.retriveItemThen({
					get: function(){
						return (page.contents.length !==0);
					},
					error: function(){
						$this.pages[5].render(page);
					},
					success: function () {
						$this.pages[5].render(page);
					}
				});

			},

			showList: function(zone_slug,tour_id){
				var $this = this;

				var tour = (tour_id !==null)?new TourModel({id:tour_id}):false;

				this._showPage(4,
					function(id){

					}
				);

				this._getCurrentZone({
					slug: zone_slug,
					success: function (zone) {

						zone.retriveItemThen({
							// Check if POI has children (if not, attempt to reload)
							get: function () {
								return (zone.getChildPOIs().length !== 0);
							},
							success: function () {
								if(tour_id!==null) {
									var tour = new TourModel({id:tour_id});
									tour.zone = zone;
									$this._setCurrentTour(tour, zone, false);
									$this.pages[4].render(tour);
									$this.navigate('/map/'+ zone_slug + "/" + tour_id + "/list",false);
								}else{
									$this.pages[4].render(zone);
									$this.navigate('/map/' + zone_slug + "/list", false);
								}
							},
							error: function () {
								$this.errorHelper.createError('critical');
							}
						});

					}
				});

			},

			//UNTESTED
			_setCurrentTour:function(tour, zone, autoload_content){
				var $this = this;

				if (this.currentTour!==tour) {
					this.currentTour = tour;
					Backbone.trigger("tour:start");

					this._getCurrentZone({
						success: function (zone) {
							// draw the tour's polyline

							$this.pages[3].renderTour(tour);

							if (typeof autoload_content === 'undefined' || autoload_content === null || autoload_content === true) {
								// show some content
								zone.tours.retriveItemThen({
									// Check if if already have content for tours (if not, attempt to load them)
									get: function () {
										return zone.get('tours').length > 0 && tour.contents.length > 0;
									},
									success: function (data) {
										$this.pages[3].renderContent($this.currentTour);
									},
									error: function () {
										var poi = zone.pois.first();
										poi.fetch({
											success: function (argument) {
												$this.pages[3].renderContent(poi);
											},
											error: function () {
												$this.pages[3].renderContent(poi);
											}
										});
									}
								});
							}
						}
					});
				}else{
					if (typeof autoload_content === 'undefined' || autoload_content === null || autoload_content === true) {
						$this.pages[3].renderContent($this.currentTour);
					}
				}
				return true;
			},

			_exitCurrentTour:function(){
				this.currentTour = null;
				Backbone.trigger("tour:end");
			},

			// Map: Displays map with specific POI content open
			showPOI: function(zone_slug, tour_id, poi_id){

				if(poi_id === null){
					poi_id = tour_id;
					tour_id = null;
				}

				var $this = this;

				var tour = false;

				if(tour_id !==null) {
					this._getCurrentZone({
						slug: zone_slug,
						success: function (zone) {
							tour = new TourModel({id: tour_id});
							$this._setCurrentTour(tour, zone, false);
							$this.showMap(zone_slug, false);
							$this._render_poi_content(poi_id);
						}
					});
				}else {
					// get map setting up
					this.showMap(zone_slug, false);
					this._render_poi_content(poi_id);
				}

			},

			_render_poi_content : function(poi_id){

				$this = this;
				// grab POI & load its contents
				var poi = new POI({id: poi_id});

				var mapView = $this.pages[3].subViews.map;

				if($this.pages[3].subViews.map.poisRendered){
					poi.set('visited', true);
					poi.set('active', true);

					mapView.trigger('contentOpen', poi);
					mapView.map.panTo(mapView.gMaps.getOffsetLatLng(mapView.map, poi));
				}else{
					$this.listenToOnce(Backbone,'poisRendered', function () {
						poi.set('visited', true);
						poi.set('active', true);

						mapView.trigger('contentOpen', poi);
						mapView.map.panTo( mapView.gMaps.getOffsetLatLng(mapView.map, poi));
					});
				}

				var doContentRender = function () {
					$this.pages[3].renderContent(poi);
					$this.pages[3].subViews.map.trigger('contentOpen',poi);
				};

				poi.retriveItemThen({
					get: function(){
						return (poi.contents.length !==0);
					},
					success: function () {
						doContentRender();
					},
					error: function(){
						// try rendering it any way, the content draw will handle any data missing errors
						doContentRender();
					}
				});


			},

			_loadZones: function(){
				var $this = this;
				// Start loading content for zones menu
				this.zones.retriveItemThen({
					get: function(){ return( $this.zones.length !== 0); },
					success: function(){
						$this.pages[1].render(0);
					},
					error: function(){
						// Stop spinner, send em home & warn user
						$this.pages[0].showNormal();
						$this.navigate('/', false);
						$this.errorHelper.createError("critical");
					}
				});
			},
			/**
			 * _onPageReady
			 * Perform an action if a given page is ready. 
			 * If page isn't ready, wait until it is the perform the action.
			 *
			 * @param id - ID of page
			 * @param options - Callbacks for onWait and onReady
			 */
			_onPageReady: function(id, options){
				var timer, $this = this, _e = null;

				// Ensure options is an object
				if(typeof id !== 'number') return false;
				if(typeof options !== 'object') return false;

				// possible callbacks
				if(typeof options.onReady !== 'function') options.onReady = function(){}; // when page is ready
				if(typeof options.onWaiting !== 'function') options.onWaiting = function(){}; // when page is still waiting on data
				 // when page loading is taking a long time
				if(typeof options.onSlow !== 'function'){
					options.onSlow = function(){
						_e = $this.errorHelper.createError("slow");
					};
				}
				
				// See if we are ready
				if(this._isPageReady(id)){
					// Do whatever is needed to showPage
					options.onReady(id);
				}else{

					// set timer for ajax slow
					timer = setTimeout(function(){ options.onSlow(); }, 4000);

					// Waiting on page being ready. Use this to show a spinner or something
					options.onWaiting(id, this.pages[id]);
					this._showLoading(id);

					// @todo tell this to the user
					this.listenToOnce(this.pages[id], "viewReady", function(){

						clearTimeout(timer);

						// Hide notice
						if(_e) _e.trigger('clear');

						// We're here. Show away
						options.onReady(id);
					});
				}
			},
			// Front page loader...
			_showLoading: function(id){
				var $this = this;
				// Wait on viewReady to stop showing loading spinner
				this.pages[0].showLoading();
				this.pages[id].once('viewReady', function(){
					$this.pages[0].showNormal();
				});
			},

			backToMap: function(){
				if(this.currentZone !== null){
					if(this.currentTour !== null){
						this.showTour(this.currentZone.get('slug'),this.currentTour.get('id'));
						this.navigate('/map/'+this.currentZone.get('slug')+"/"+this.currentTour.get('id'));
					}else {
						this.showZone(this.currentZone.get('slug'));
						this.navigate('/map/' + this.currentZone.get('slug'));
					}
				}
				else{
					this.zoneMenu();
				}
			},
			/**
			 * _showPage
			 * Show a given page as soon as it is ready.
			 *
			 * @param id - ID of page
			 * @param options - Callbacks for onWait
			 */
			_showPage: function(id, onWait){
				var $this = this;
				this._onPageReady(id, {
					onReady: function(){
						$this.currentPage = id;
						$this._slideToPage(id);

						// If view has an onshow
						var view = $this._getCurrentPage();
						if(typeof view.onShow === 'function'){
							view.onShow();
						}
					},
					onWaiting: onWait
				});
			},
			/**
			 * _isPageReady
			 * Check if page is ready
			 *
			 * @param id - ID of page
			 */
			_isPageReady: function(id){
				return (typeof this.pages[id] !== 'undefined' && this.pages[id].ready === true);
			},

			/**
			 * _slideToPage
			 * Slide a specific page in to the app viewport
			 *
			 * @param id - ID of page
			 */
			_slideToPage: function(id){

				var move_to = -(window.innerWidth*id) + 'px';
				$('.app_wrapper').css('transform', 'translateX('+move_to+')');
                Backbone.trigger('menu:open');
                Backbone.trigger('page:show',{id:id,page:this.pages[id]});

			},
			/**
			 * _setCurrentZone
			 * Set a zone as the current zone.
			 * if zone is changed, trigger redraw of the map.
			 *
			 * @param zone - Zone object
			 * @throws ZoneIsNotAZoneError on invalid zone being passed in
			 */
			_setCurrentZone:function(zone){
				// If zone hasn't changed, do nothing.
				if(zone === this.currentZone) return false;
				// Ensure valid zone was passed
				if(!(zone instanceof ZoneModel)) throw new ZoneIsNotAZoneError();
				
				// Update "currentZone" & re-fetch/render changes.
				this.currentZone = zone;

				// Render POI's
				var $this = this;
				zone.retriveItemThen({
					// Check if POI has children (if not, attempt to reload)
					get: function(){ return (zone.getChildPOIs().length !== 0); },
					success: function(){
						$this.pages[3].render(zone);
					},
					error: function () {
						$this.errorHelper.createError('critical');
					}
				});

				return true;
			},
			/**
			 * _getCurrentZone
			 * Perform an action with a given zone.
			 *
			 * @param (callback) options.success - Provided with zone object once its ready
			 * @param (callback) options.error - when unable to get currentZone
			 * @param (string) options.slug - string of slug
			 * @param (boolean) options.force - Force function to attempt to reload zone from slug
			 */
			_getCurrentZone: function(options){
				// Ensure options is an object
				if(typeof options !== 'object') return false;

				// Stub all required methods (if they are not provided)
				if(typeof options.success !== 'function') options.success = function(){};
				if(typeof options.error !== 'function') options.error = function(){$this.errorHelper.createError('critical');};
				if(typeof options.slug !== 'string') options.slug = false;

				// Force lookup on slug
				if(typeof options.force !== 'boolean') options.force = false;

				// return instant if we have a current zone
				var $this = this;
				if(this.currentZone && !options.force) return options.success(this.currentZone);

				// Hard fail
				if(!options.slug) return options.error();

				// work it out / load data needed to work it out
				this.zones.retriveItemThen({
					get: function(){
						return $this.zones.findWhere({ slug: options.slug });
					}, 
					success: function(zone){
						// All went well, populate page
						$this._setCurrentZone(zone);
						options.success(zone);
					},
					error: options.error
				});
			},

			/**
			 * _fragmentHasHandler
			 * check that the given fragment has a route to handle it.
			 */
			_fragmentHasHandler: function (fragment) {
				return _.any(Backbone.history.handlers, function(handler) {
					if (handler.route.test(fragment)) {
						return true;
					}
				});
			},

			/**
			 * _getUpFragment
			 * get fragment to navigate up a url.
			 * So map/canterbury/poi/16 becomes map/canterbury/poi
			 *
			 * @param fragment - the fragment to get up from, defaults to the current fragment according to Backbone.history
			 */
			_getUpFragment: function (fragment) {
				fragment = typeof fragment !== 'undefined' ? fragment : Backbone.history.getFragment();

				// cannot go any further back than home
				if (fragment === '') { return ''; }
				
				//remove any training slashes
				fragment = fragment.indexOf('/', fragment.length - 1) !== -1 ? fragment.substring(0, fragment.length-1) : fragment;
				// remove last bit of url
				var fragment_parts = fragment.split('/');
				fragment_parts.pop();
				
				fragment = fragment_parts.join('/');

				if (this._fragmentHasHandler(fragment)) {
					return fragment;
				}
				else {
					return this._getUpFragment(fragment);
				}

			},
			/**
			 * getCurrentPage
			 * @return view for current page
			 */
			_getCurrentPage: function(){
				return this._getPage(this.currentPage);
			},

			/**
			 * getCurrentPage
			 * @return view for page
			 */
			_getPage: function(id){
				return this.pages[id];
			},

			/**
			 * refresh
			 * Refresh the current route.
			 */
			refresh: function () {
				var fragment = Backbone.history.getFragment();

				// unfortunately, we need to navigate twice in order to force backbone to re-route
				window.app.navigate('', {trigger: false}); // this will not be remembered in history
				window.app.navigate(fragment, {trigger:true, replace:true});
			},


			/**
			 * navigateUp
			 * Navigate up a url.
			 * So map/canterbury/poi/16 becomes map/canterbury/poi
			 *
			 * @param fragment - the fragment to navigate up from, defaults to the current fragment according to Backbone.history
			 */
			navigateUp: function (fragment) {
				fragment = typeof fragment !== 'undefined' ? this._getUpFragment(fragment) : this._getUpFragment();

				if (this._fragmentHasHandler(fragment)) {
					// navigate
					window.app.navigate(fragment, true);
				}
				else {
					this.navigateUp(fragment);
				}

			},

            toggleMenu: function(){
                this.menu.toggle();
            },

            toggleAudioMenu: function(){
                this.audioMenu.toggle();
            }

		});
	}
);
