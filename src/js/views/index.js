define(
	[
		'backbone'
	], 
	function(Backbone){
		return Backbone.View.extend({
			ready: true,
			events: {
				'click  a.start': 'show_zones',
				'click':'show_zones'
			},
			initialize: function(){

			},

			showLoading: function(){
				this.$el.find("a.start .icon").removeClass("kf-angle-right").addClass("kf-spinner").addClass(" kf-spin");
			},
			showNormal: function(){
				this.$el.find("a.start .icon").removeClass("kf-spinner").removeClass("kf-spin").addClass("kf-angle-right");
			},


			show_zones: function(){
				window.app.navigate('/campuses',  true );
			},
		});
	}
);