describe('ZonesCollection', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/config', 'app/collections/zones' ], function(AppConfig, ZonesCollection){
			DIC.AppConfig = AppConfig;
			DIC.ZonesCollection = ZonesCollection;

			done();
		});
	});

	describe('#url', function(){
		it('returns the correct API endpoint', function(){
			var subject = new DIC.ZonesCollection();
			expect(subject.url()).to.eql(DIC.AppConfig.endpoint + '/zones');
		});
	});
});