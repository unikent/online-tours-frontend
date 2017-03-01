define(['backbone'], function(Backbone) {

	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
	(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
	m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
	})(window,document,'script','//www.google-analytics.com/analytics.js','ga');

	// Primary tours tracker
	ga('create', 'UA-64928888-1', 'auto', {'name': 'tours'});
	ga('tours.require', 'displayfeatures');
	ga('tours.require', 'linkid', 'linkid.js');
	ga('tours.send', 'pageview');

	// UniKent single property
	ga('create', 'UA-54179016-1', 'auto', {'name': 'central'});
	ga('central.require', 'displayfeatures');
	ga('central.require', 'linkid', 'linkid.js');
	ga('central.send', 'pageview');

	return {
	   page: function(path){
			var trackers = ga.getAll();
			for(t in trackers) {
				try { trackers[t].send('pageview', {"page": path}); } catch(err) { /* Fail silently */ }
			}
	 	},
		event: function(category, action, label, value) {
			var trackers = ga.getAll();
			for(t in trackers) {
				try { trackers[t].send('event', category, action, label, value); } catch(err) { /* Fail silently */ }
			}
		}
	};
});
