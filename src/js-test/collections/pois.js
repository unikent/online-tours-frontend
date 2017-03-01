describe('POICollection', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/collections/pois' ], function(POICollection){
			DIC.POICollection = POICollection;
			done();
		});
	});
});