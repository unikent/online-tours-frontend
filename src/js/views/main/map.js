define(
	[
		'require',
		'backbone', 
		'app/components/google_maps',
		'app/views/main/map_pin',
		'app/components/geolocationmarker',
		'app/components/infobox',
		'app/views/error_helper',
		'app/config'
	],
	function(require, Backbone, gmapps, Pin, geoMarker, infoBox, ErrorHelper, AppConfig){
		return Backbone.View.extend({
			map: null,
			gMaps: null,
			pois: null,
			pins: [],
			userLocation: null,
			events: {


			},
			mapReady: false,
			fitted: false,
			maxBounds: false,
			poisRendered: false,
			geolocationEnabled: false,
			followLocation: false,
			geolocationMinimumAccuracy: 100,
			geoMarker : false,
			controlsDiv : null,

			initialize: function(){

				this.controlsDiv = document.createElement('div');
				this.controlsDiv.className =  'map-controls';
				this.errorHelper = new ErrorHelper({});
				var $this = this;
				gmapps.done(function(GoogleMaps){
					
					// Boot infobox 
					infoBox.init();

					// Boot geo marker
					geoMarker.init();

					// One google maps is loaded, trigger render function
					$this.gMaps = GoogleMaps;
					$this.renderGoogleMap();

				}).fail(function(){
					$this.errorHelper.createError("critical");
				});
				
			},
			renderGoogleMap: function(){
				// Create google map object.
				this.map = new this.gMaps.Map(this.el,
					{
						// Basic
						center: new this.gMaps.LatLng(51.2962564,1.0655308),
						zoom: 16,
						maxZoom: 19,
						minZoom: 13,
						mapTypeId: this.gMaps.MapTypeId.ROADMAP,
						// Remove the built in POI's
						styles: [{
							featureType: "poi",
							elementType: "labels",
							stylers: [{ visibility: "off" }]
						}],
						// Hide unwanted controls
						mapTypeControl: false,
						zoomControl: false,
						// place street view control on top left side
						streetViewControlOptions: {
							position: google.maps.ControlPosition.LEFT_TOP
						},
					}
				);
				// Wait for map to be ready before triggering map logic.
				this.gMaps.event.addListenerOnce(this.map, 'idle', function(e){ 
					$this.mapReady = true;
					$this.trigger('mapReady');
				});
				
				var $this = this;

				this.initGeolocation();
				
				this.gMaps.event.addListener(this.map, 'click',function(e){ $this.onMapClick(); });
				this.gMaps.event.addListener(this.map, 'dragstart',function(e){ $this.onMapDrag(); });
				this.gMaps.event.addListener(this.map,'center_changed',function(e) { $this.checkBounds();});
				this.gMaps.event.addListener(this.map, 'dragend', function(e){ $this.unfollowGeolocationMarker(); });

				var controlUI = document.createElement('div');
				controlUI.className = 'map-btn list-map-btn';
				controlUI.title = 'Search the map';

				$(this.controlsDiv).prepend(controlUI);

				// Set CSS for the control interior
				var controlIcon = document.createElement('i');
				controlIcon.className = 'kf-search';
				controlUI.appendChild(controlIcon);
				this.map.controls[this.gMaps.ControlPosition.TOP_RIGHT].push(this.controlsDiv);

				this.gMaps.event.addDomListener(controlUI, 'click', this.showList);
			},

			render: function(zone){
				// Get POI's to render
				var $this = this;
				this.pois = zone.getChildPOIs();

				if(this.mapReady){
					this.renderPois();
				}else {
					this.once('mapReady', function () {
						$this.renderPois();
					});
				}

			},

			renderTour: function(tour){
				// Get POI's to render
				var $this = this;


				var dorender = function () {
					$this.resetMap();
					var polyline = tour.get('polylineobj');

					if(polyline.length > 0){
						$this.currentPolygon = $this.renderPolyline(polyline);
						$this.map.fitBounds($this.currentPolygon.bounds);
						$this.gMaps.offset($this.map);

						$this.fitted = true;
					}

					if($this.poisRendered){
						$this.highligtTourPins(tour);
					}else {
						$this.listenToOnce(Backbone,'poisRendered', function () {
							$this.highligtTourPins(tour);
						});
					}

				};

				if(this.mapReady){
					dorender();
				}else {
					this.once('mapReady', function () {
						dorender();
					});
				}

			},

			onMapClick: function(){
				this.trigger('infoBoxOpen');
				Backbone.trigger('map:interact');
			},
			onMapDrag: function(){
				Backbone.trigger('map:interact');
			},

			renderPois: function(){
				var $this = this;
				if (!this.fitted) {
					var bounds = this.gMaps.getBounds(this.pois);

					this.maxBounds = this.gMaps.expandBounds(bounds);
					var pos = this.getCurrentGeolocationLatLng();

					if(this.geoMarker && pos){
						if($this.maxBounds.contains(pos)) {
							bounds.extend(pos);
						}
					}

					this.map.fitBounds(bounds);
					this.gMaps.offset(this.map);

					$this.fitted = true;
				}
				// Clean up existing pins
				_(this.pins).each(function(pin){
					pin.delete();
					pin.remove();
				});
				this.pins = [];

				// Create new pins
				this.pois.each(function(poi){
					poi.set({enabled: true, active:false, focus:false});
					$this.pins.push(new Pin({model: poi, map: $this.map, gMaps: $this.gMaps, mapView: $this}));
				});

				this.poisRendered = true;

				Backbone.trigger('poisRendered');
			},

			renderPolyline: function (polyline) {
				var gpolyline = this.gMaps.generateGPolyline(polyline);
				gpolyline.setMap(this.map);
				return gpolyline;
			},

			// colour markers outside the tour grey.
			highligtTourPins: function (tour) {
				// first disable all the pins
				this.pois.each(function(poi){
					poi.set({enabled: false});
				});

				// then enable the tour's pois
				tour.pois.each(function(poi){
					poi.set({enabled: true});
				});
			},

			// reset the map to a state of displaying only the pois of its zone
			resetMap: function () {
				this.fitted = false;
				if(this.mapReady && this.pois !== null) {
					var bounds = this.gMaps.getBounds(this.pois);
					this.map.fitBounds(bounds);
					this.maxBounds = this.gMaps.expandBounds(bounds);
				}
				this.trigger('infoBoxOpen');
				// enable all pins if they're populated
				if (this.pois) {
					this.pois.each(function(poi){
						poi.set({enabled: true, active:false, focus:false});
					});
				}

				//clear all drawn polylines
				if (typeof this.currentPolygon !== 'undefined') {
					this.currentPolygon.setMap(null);
				}
			},

			checkBounds: function(){
				if(this.maxBounds !==false) {
					this.gMaps.checkBounds(this.maxBounds,this.map);
				}
			},

			initGeolocation: function () {
				var $this = this;
				var GeoMarker = new GeolocationMarker(this.map);
				this.geoMarker = GeoMarker;
				GeoMarker.setMinimumAccuracy(this.geolocationMinimumAccuracy);
				GeoMarker.setMarkerOptions({
					icon: {
						url: AppConfig.basePath + '/img/icons/geolocation-marker.png',
						anchor: new google.maps.Point(7, 7)
					}
				});
				GeoMarker.setCircleOptions({
					fillColor: '#000000',
					fillOpacity: '0.15',
					strokeWeight: 0
				});
				this.followLocation = false;

				// code from: https://developers.google.com/maps/documentation/javascript/examples/control-custom
				function CenterControl(controlDiv, map) {

					// Set CSS for the control border
					var controlUI = document.createElement('div');
					controlUI.className = 'map-btn center-map-btn';
					controlUI.title = 'Click to centre the map';

					controlDiv.appendChild(controlUI);

					// Set CSS for the control interior
					var controlIcon = document.createElement('i');
					controlIcon.className = 'kf-location';
					controlUI.appendChild(controlIcon);

					$this.gMaps.event.addDomListener(controlUI, 'click', function() {
						if($this.geoMarker.getPosition() !== null){
							$this.followGeolocationMarker();
							$this.map.setCenter($this.geoMarker.getPosition());
							Backbone.trigger('map:interact');
						}
						else{
							// TODO: display error message -- should never get here though
							console.log('unable to retrieve current position');
						}
					});

				}

				var followMeControl = new CenterControl(this.controlsDiv, this.map);

				// UI should be hidden by default
				this.hidefollowMeControl();

				this.gMaps.event.addListener(GeoMarker, 'geolocation_error', function() {
					// No geo location, no geo options
					$this.enableGeolocation(false);
				});

				this.gMaps.event.addListener(GeoMarker, 'position_changed', function() {
					if ($this.geoMarker.getPosition() !== null) {

						// Reset geolocation if it hasnt been enabled at this point
						if ($this.geolocationEnabled === false) {
							$this.resetGeolocation();
						}

						// follow the user
						if ($this.followLocation === true) {
							this.map.setCenter($this.geoMarker.getPosition());
						}
					}

					// Reset geolocation if it is meant to be enable (which should swich it off)
					else if ($this.geolocationEnabled === true) {
						$this.resetGeolocation();
					}
				});

				this.gMaps.event.addListener(GeoMarker, 'accuracy_changed', function() {
					$this.resetGeolocation();
				});
			},

			hideGeolocationMarker: function () {
				this.geoMarker.setMarkerOptions({visible:false});
				this.geoMarker.setCircleOptions({visible:false});
			},

			showGeolocationMarker: function () {
				this.geoMarker.setMarkerOptions({visible:true});
				this.geoMarker.setCircleOptions({visible:true});
			},

			hidefollowMeControl: function () {
				$(this.controlsDiv).find('.center-map-btn').addClass('hidden');
			},

			showfollowMeControl: function () {
				$(this.controlsDiv).find('.center-map-btn').removeClass('hidden');
			},

			resetGeolocation: function () {

				// Don't attempt to centre if geomarker is not yet ready
				if(!this.geoMarker) return;

				if (this.geoMarker.getAccuracy() === null) {
					this.enableGeolocation(false);
				}
				else if(this.geoMarker.getAccuracy() > this.geolocationMinimumAccuracy || this.geoMarker.getPosition() === null){
					if (this.geolocationEnabled === true) {
						this.enableGeolocation(false);
					}
				}
				else{
					if (this.geolocationEnabled === false) {
						this.enableGeolocation();
					}
				}
			},

			enableGeolocation: function (enable) {
				if (typeof enable === 'undefined') enable = true;

				if (enable) {
					this.showGeolocationMarker();
					this.showfollowMeControl();
					this.geolocationEnabled = true;
				}
				else{
					this.hideGeolocationMarker();
					this.hidefollowMeControl();
					this.geolocationEnabled = false;
				}
			},

			followGeolocationMarker: function () {
				this.followLocation = true;
				$(this.followMeDiv).find('> div').addClass('active');
			},

			unfollowGeolocationMarker: function () {
				this.followLocation = false;
				$(this.followMeDiv).find('> div').removeClass('active');
			},

			getCurrentGeolocationLatLng: function() {
				if(this.geoMarker) {

					if (this.geoMarker.getAccuracy() === null) {
						return false;
					}
					else if (this.geoMarker.getAccuracy() > this.geolocationMinimumAccuracy || this.geoMarker.getPosition() === null) {
						return false;
					}
					else {
						if (this.geolocationEnabled === false) {
							return false;
						} else {
							return this.geoMarker.getPosition();
						}
					}
				}else{
					return false;
				}
			},

			showList: function () {

				if(window.app.currentTour!==null){
					window.app.navigate('/map/' + window.app.currentZone.get('slug') +'/' +window.app.currentTour.get('id') + '/list',  true );
				}else{
					window.app.navigate('/map/' + window.app.currentZone.get('slug') +'/list',  true );
				}
			}

		});
	}
);