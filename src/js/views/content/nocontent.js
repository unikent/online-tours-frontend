define(
	[
		'backbone',
		'app/models/poi',
		'app/models/tour',
		'app/views/content/content_type',
		'text!app/templates/content_no_content.html'
	],
	function(Backbone, POIModel, TourModel, BaseView, NoContentTemplate){
		return BaseView.extend({

			events: {
				'click .refresh': 'handleRefresh',
				'click .goback': 'handleBack'
			},

			initialize: function(data){
				this.data = typeof data !== 'undefined' ? data : {};
				this.template = _.template(NoContentTemplate);
			},

			render: function () {
				var params = {};
				params.refresh = true;

				if (this.model instanceof POIModel) {
					params.back = true;
				}
				
				this.$el.html(this.template(params)).addClass('content-item content-no-content');

				return this;
			},

			handleRefresh: function () {
				window.app.refresh();
			},

			handleBack: function () {
				window.app.navigateUp();
			}

		});
	}
);