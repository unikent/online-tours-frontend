define(
	[
		'backbone',
		'text!app/templates/infobox.html',
		'app/config',
		'app/views/error_helper',
	],
	function(Backbone, infoboxTemplate, AppConfig, ErrorHelper ){
		return Backbone.View.extend({
			gMaps: null, // google.maps obj
			map: null, // current map
			model: null, // data model,
			marker: null, // marker instance
			mapView: null, //the parent map view

			initialize: function(data){
				// Store data
				this.model = data.model;
				this.gMaps = data.gMaps;
				this.map = data.map;
				this.mapView = data.mapView;

				// Create marker
				this.marker = new this.gMaps.Marker({
					position: this.gMaps.getLatLng(this.model),
					map: this.map,
					title: this.model.get('name'),
					icon: this.gMaps.kentIcons().default
				});

				this.errorHelper = new ErrorHelper({});

                var $this = this;

                this.model.on("change:icon", function(){
                    $this.updateIcon();
                });
                this.model.resetIcon();

                var ib = _.template(infoboxTemplate);
                var ibContent = ib({name:this.model.get('name')});

				this.infobox = new InfoBox({content:ibContent,closeBoxURL:"",infoBoxClearance:new this.gMaps.Size(10,150),pixelOffset:new this.gMaps.Size(-30,5)});


				this.gMaps.event.addListener(this.marker, 'click', function(e){ $this.click(e); });

				this.listenTo(this.mapView,'infoBoxOpen',function(pin){
					this.model.set({focus: this === pin});
					this.marker.focus=true;
					if(this.model.get('focus')) {
						var $this = this;
						this.infobox.open(this.map, this.marker);
						this.infobox.addListener("domready", function () {
							$this.gMaps.event.addDomListener($this.infobox.div_, 'click', function (e) {
								$this.open(e);
							});
						});
					}else{
						this.infobox.close();
					}

				});

				this.listenTo(this.mapView,'contentOpen',function(poiModel){
					this.model.set({
						active: this.model === poiModel,
						visited: this.model.get('visited') || this.model === poiModel,
						focus: this.model === poiModel
					});

					if(this.model === poiModel){
						this.infobox.close();
					}

				});
			},


			click: function(){
				this.mapView.trigger('infoBoxOpen',this);
				Backbone.trigger('map:interact');
			},

			open: function(){
				var $this = this;
				$(this.infobox.div_).find('.tooltip-icon').removeClass('kf-chevron-right').addClass('kf-spinner kf-spin');
				$this.model.set({visited: true});

				var doOpen = function () {
					$this.mapView.trigger('contentOpen',$this.model);
					if(window.app.currentTour!==null){
						window.app.navigate('map/' + window.app.currentZone.get('slug') +'/' +window.app.currentTour.get('id') + '/poi/'+$this.model.get('id'),  true );
					}else{
						window.app.navigate('map/' + window.app.currentZone.get('slug') +'/poi/'+$this.model.get('id'),  true );
					}
				};
				
				//retrieve content, then navigate to poi view to re-render content view
				$this.model.retriveItemThen({
					get: function(){
						return ($this.model.contents.length !==0);
					},
					success: function () {
						doOpen();
					},
					error: function(){
						// Do it anyway, content draw should handle any content errors
						doOpen();
					}
				});

			},

			updateIcon: function(){
				var $this = this;

				if( $this.marker.getZIndex() <= $this.gMaps.Marker.MAX_ZINDEX){
					this.oldZ = $this.marker.getZIndex();
				}
				switch (this.model.get('icon')){
					case 'active':
						this.marker.setIcon(this.gMaps.kentIcons().active);
						$this.marker.setZIndex($this.gMaps.Marker.MAX_ZINDEX + 1);
						break;
					case 'focus':
						this.marker.setIcon(this.gMaps.kentIcons().focus);
						$this.marker.setZIndex($this.gMaps.Marker.MAX_ZINDEX + 1);
						break;
					case 'default':
						this.marker.setIcon(this.gMaps.kentIcons().default);
						this.marker.setZIndex(this.oldZ);
						break;
					case 'visited':
						this.marker.setIcon(this.gMaps.kentIcons().visited);
						this.marker.setZIndex(this.oldZ);
						break;
					case 'fade':
						this.marker.setIcon(this.gMaps.kentIcons().fade);
						this.marker.setZIndex(this.oldZ);
						this.marker.setVisible(false);
						break;
					default:
				}

				if( this.model.get('icon') !=='fade'){
					this.marker.setVisible(true);
				}

			},

			delete: function(){
				this.marker.setMap(null);
			}
		});
	}
);