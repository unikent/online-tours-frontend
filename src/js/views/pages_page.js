define(
	[
		'backbone',
		'app/config',
		'text!app/templates/page.html',
		'app/views/content/contents'
	],
	function(Backbone, config, PageTemplate, ContentsView){
		return Backbone.View.extend({

			templates: {},
			page: null,
			contents: null,
			events: {
				'click .back': 'show_map'
			},

			initialize: function(data){

				this.$el = $('<div class="app_page pages_page"></div>');
				$(".app_wrapper").append(this.$el);
				this.el = this.$el[0];

				this.templates.page = _.template(PageTemplate);

			},

			render: function(page){
				var $this = this;

				var html = this.templates.page({title: page.get('title'), 'base_url': config.basePath});

				this.$el.html(html);

				var contentList = this.$el.find('.contents').first();

				if(this.contents !== null){
					this.contents.cleanup();
				}

				this.contents = new ContentsView({el:contentList,obj:page});
				// scroll to top
				var scrollContainer = this.$el.find('.scroll-container');
				scrollContainer.scroll(function(){
					if ($(this).scrollTop() > 200) {
						$('.scroll-to-top').fadeIn();
					} else {
						$('.scroll-to-top').hide();
					}
				});
				scrollContainer.find('.scroll-to-top').click(function () {
					$this.$el.scrollTop(0);
				});

				this.ready = true;
				this.trigger("viewReady");
			},

			show_map: function(e){
				Backbone.history.history.back();
			}

		});
	}
);