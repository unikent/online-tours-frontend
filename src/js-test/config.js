describe('AppConfig', function(){
	var DIC = {};

	beforeEach(function(done){
		require([ 'underscore', 'app/config' ], function(_, AppConfig){
			DIC.AppConfig = AppConfig;
			done();
		});		
	});

	afterEach(function(){
		window.appConfig = undefined;
		DIC.AppConfig.loadConfig();
	});

	describe('initializer', function(done){
		it('loads the default config', function(){
			expect(DIC.AppConfig._configuration).to.eql(DIC.AppConfig._defaults);
		});

		it('assigns config attributes to the AppConfig object', function(){
			_.forEach(DIC.AppConfig._configuration, function(value, key){
				expect(DIC.AppConfig[key]).to.eql(value);
			});
		});

		it('sets basePath to \'\'', function(){
			expect(DIC.AppConfig.basePath).to.eql('');
		});

		it('sets endpoint to \'//api.kent.ac.uk\'', function(){
			expect(DIC.AppConfig.endpoint).to.contain('//api.kent.ac.uk');
		});
	});

	describe('loadConfig', function(){
		it('it merges overrides from window.appConfig', function(){
			window.appConfig = { basePath: '/bar' };
			
			DIC.AppConfig.loadConfig();
			expect(DIC.AppConfig.basePath).to.eql('/bar');
		});

		it('it adds additional config options from window.appConfig', function(){
			window.appConfig = { foo: 'bar' };
			
			DIC.AppConfig.loadConfig();
			expect(DIC.AppConfig.foo).to.eql('bar');
		});

		it('removes redundant config attributes from the AppConfig object', function(){
			window.appConfig = { foo: 'bar' };
			
			DIC.AppConfig.loadConfig();
			window.appConfig = undefined;

			DIC.AppConfig.loadConfig();
			expect(DIC.AppConfig.foo).to.be.undefined;
		});
	});
});