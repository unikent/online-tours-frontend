define(function(require){
	var mocha = require('mocha');
	var chai = require('chai');

	expect = chai.expect; // Has to be attached to the window object to be available in tests. Boo.

	mocha.setup('bdd');
	mocha.bail(false);
 
 	// Jiggery-pokery to make Mocha and RequireJS play nice. Might be a nicer way to handle this?
	require([ 
		'app_test/config',

		'app_test/errors/not_implemented',

		'app_test/models/base',
		'app_test/models/poi',
        'app_test/models/page',
		'app_test/models/tour',
		'app_test/models/zone',

		'app_test/collections/base',
		'app_test/collections/pois',
		'app_test/collections/tours',
		'app_test/collections/zones',

		'app_test/components/google_maps',

		'app_test/controllers/app'
	], function(expect){
		if (typeof mochaPhantomJS !== 'undefined') {
			mochaPhantomJS.run();
		}
		else {
			mocha.run();
		}
	});
});