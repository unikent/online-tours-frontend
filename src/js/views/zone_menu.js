define(
	[
		'backbone',
		'app/config',
		'text!app/templates/campus-menu.html',
		'text!app/templates/menu-item.html',
	],
	function(Backbone, config, menuTemplate, menuItemTemplate){
		return Backbone.View.extend({
			ready: false,
			zones: null,
			templates: {},
			events: {
				'click .back': 'show_home',
				'click .menu li': 'show_tours'
			},
			initialize: function(data){

				this.zones = data.collection;

				this.$el = $('<div class="app_page startmenu zone"></div>');
				$(".app_wrapper").append(this.$el);
				this.el = this.$el[0];

				this.templates.main = _.template(menuTemplate);
				this.templates.item = _.template(menuItemTemplate);

			},
			onShow: function(){
				/* Bypass page and jump straight to campus options?
				if(this.zones.length === 1){
					//console.log('/campuses/' + this.zones.models[0].get('slug'));
					window.app.navigate('/campuses/' + this.zones.models[0].get('slug'),  true );
					return;
				}
				*/
			},

			render: function(){

				// Compile the template using underscore
				var page = this.templates.main({title: 'Select campus', 'base_url': config.basePath, back_to: 'Home'});

				this.$el.html(page);

				var menu = $(document.createElement("ul")).appendTo(this.$el.find('section.menu'));

				var $this = this;

				this.zones.each(function(item){
					menu.append($this.templates.item({'name': item.get('name'), 'slug': item.get('slug')}));
				});

				// Good to go :D
				this.ready = true;
				this.trigger("viewReady");

			},

			show_home: function(){
				window.app.navigate('/',  true );
			},

			show_tours: function(e){
				var slug = $(e.currentTarget).attr('data-slug');
				window.app.navigate('/campuses/' + slug,  true );
			}

		});
	}
);
