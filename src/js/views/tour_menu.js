define(
	[
		'backbone',
		'app/config',
		'text!app/templates/menu.html',
		'text!app/templates/menu-item.html'
	],
	function(Backbone, config, menuTemplate, menuItemTemplate){
		return Backbone.View.extend({
			ready: false,
			zones: null,
			zone_slug: null,
			templates: {},
			events: {
				'click .back': 'show_zones',
				'click .menu li': 'show_map',
			},
			initialize: function(){

				this.zones = this.collection;

				this.$el = $('<div class="app_page startmenu tour"></div>');
				$(".app_wrapper").append(this.$el);
				this.el = this.$el[0];

				this.templates.main = _.template(menuTemplate);
				this.templates.item = _.template(menuItemTemplate);

				// don't render this on init as we need more data first...
			},

			render: function(zone){
				var $this = this;
				var $zone = this.zones.get(zone);
				// Compile the template using underscore

				var page = this.templates.main({title: $zone.get('name'), 'base_url': config.basePath, back_to: 'Select campus'});

				this.$el.html(page);

				// Make general tour link
				var explore = $(document.createElement("ul")).append($this.templates.item({'name': 'Explore by myself', 'id': -1}));
				// Header
				//var title = $(document.createElement("h3")).text("Popular tours");
				// Additional tours from collection
				var tours = $(document.createElement("ul"));

				$zone.tours.each(function(item){

					tours.append($this.templates.item({'name': item.get('name'), 'id': item.get('id'),'duration':item.get('duration'),'description':item.get('description')}));

				});

				var section = this.$el.find('section.menu').append(tours).append(explore);

				// Ready :)
				this.zone_slug = zone.get('slug');
				this.ready = true;
				this.trigger("viewReady");

			},
			show_zones: function(){
				window.app.navigate('/campuses',  true );
			},
			show_map: function(e){

				// Page gets re-rendered when viewed so this will be auto cleaned up
				$(e.currentTarget).find("i").removeClass('kf-chevron-right').addClass('kf-spinner kf-spin');

				var tour_id = $(e.currentTarget).attr('data-id');

				// Only append tour ID if starting a tour.
				if(tour_id === '-1'){
					window.app.navigate('/map/'+this.zone_slug,  true );
				}else{
					window.app.navigate('/map/'+this.zone_slug + '/' +tour_id,  true );
				}

			}

		});
	}
);
