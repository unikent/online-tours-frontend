define(
	[
		'backbone',
		'text!app/templates/main.html',
		'app/views/main/map',
		'app/views/main/content_draw',
		'app/components/audioPlayer'
	],
	function(Backbone, mainTemplate, Map, ContentArea, AudioPlayer){
		return Backbone.View.extend({
			ready: false,
			zones: null,
			audio:null,
			subViews: {
				header: null,
				map: null,
				content: null,
			},

			initialize: function(){
				
				this.zones = this.collection;

				var template = _.template(mainTemplate);

				// Create element in DOM
				this.$el = $('<div class="app_page main"></div>');
				$(".app_wrapper").append(this.$el);
				this.el = this.$el[0];

				// Render structure
				this.$el.html(template({}));

				// Init sub views
				this.subViews.map = new Map({el: this.$el.find('section.map')});
				this.subViews.content = new ContentArea({el: this.$el.find('section.content') });

				this.audio = new AudioPlayer();
            },

			render: function(zone){
				// Re draw map icons
				this.subViews.map.render(zone);

				// if we're in a tour

				this.ready = true;
				this.trigger("viewReady");
			},

			renderTour: function(tour){
				// Re draw tour route
				this.subViews.map.renderTour(tour);
			},

			renderContent: function(obj){
				this.subViews.content.render(obj);
			},

			resetMap: function () {
				this.subViews.map.resetMap();
			},

			
		});
	}
);