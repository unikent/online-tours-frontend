require([ 'jquery', 'app/controllers/app', 'app/components/analytics' ], function($, AppController, ga_helper) {

	// Bootstrap the app
	var app = new AppController();

	// Hook up start button
	$("div.index a.start").click(function(e){
		e.preventDefault();
		app.navigate('campuses',  true );
	});

	// Add analytics
	app.on('route', function(route, params) {
		// on page change
		ga_helper.page('/'+Backbone.history.fragment);
	});

	window.app = app;
});
