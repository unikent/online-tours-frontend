describe('BaseCollection', function(){
	var DIC = {};
    var xhr, requests;
    
 	// Jiggery-pokery to make Mocha and RequireJS play nice. Might be a nicer way to handle this? If there is I haven't found it!
	beforeEach(function(done){
		requirejs([ 'sinon', 'backbone', 'app/config', 'app/collections/base', 'app/errors/not_implemented' ], function(sinon, backbone, AppConfig, BaseCollection, NotImplementedError){
			DIC.AppConfig = AppConfig;
			DIC.BaseCollection = BaseCollection;
			DIC.NotImplementedError = NotImplementedError;

			done();
		});
	});

    describe('#fetch', function(){

        before(function () {
            xhr = sinon.useFakeXMLHttpRequest();
            requests = [];
            xhr.onCreate = function (req) { requests.push(req); };
        });

        after(function () {
            // Like before we must clean up when tampering with globals.
            xhr.restore();
        });

    	it('calls #sync', function(){
    		var subject = new DIC.BaseCollection({ url: '/foobar' });
            subject.fetch();
            expect(requests).to.have.length(1);
    	});
    });

	describe('#sync', function(){
		it('throws NotImplementedError when method is create, update, patch, delete', function(){
			var subject = new DIC.BaseCollection({ url: '/foobar' }); // .sync requires a URL to be specified

			var f = subject.sync;
			var e = DIC.NotImplementedError;

			// Test using Backbone's CRUD mappings, see: http://backbonejs.org/#Sync
			expect(subject.sync.bind('create', subject)).to.throw(DIC.NotImplementedError);
			expect(subject.sync.bind('update', subject)).to.throw(DIC.NotImplementedError);
			expect(subject.sync.bind('patch', subject)).to.throw(DIC.NotImplementedError);
			expect(subject.sync.bind('delete', subject)).to.throw(DIC.NotImplementedError);
		});

		it('does not throw a NotImplementedError when method is read', function(){
			var subject = new DIC.BaseCollection();
			expect(subject.sync.bind('read', subject)).to.throw(DIC.NotImplementedError, 'The method you called has not been implemented!');
		});

		describe('request is a read', function(){			
	    	it('calls parent', function(){
				var subject = new DIC.BaseCollection({ url: '/foobar' }); // .sync requires a URL to be specified

	    		Backbone.Collection.prototype.sync = sinon.spy();
				subject.sync('read', subject);

	     		expect(Backbone.Collection.prototype.sync.calledOnce).to.be.true;
	    	});

	    	describe('AppConfig.cors is true', function(){
		    	it('performs a crossDomain request', function(){
					var subject = new DIC.BaseCollection({ url: '/foobar' }); // .sync requires a URL to be specified

		    		// Load a config override to enable CORS
		    		window.appConfig = { cors: true };
		    		DIC.AppConfig.loadConfig();

		    		// Place a spy on the parent function
		    		Backbone.Collection.prototype.sync = sinon.spy();

		    		// Call and verify that the options were passed
					subject.sync('read', subject);
		    		var args = Backbone.Collection.prototype.sync.args[0];
		    		expect(args[2].crossDomain).to.be.true;

		    		// Clear our custom config
		    		window.appConfig = undefined;
		    		DIC.AppConfig.loadConfig();
		    	});
	    	});
		});
	});

	describe('#url', function(){
		it('is the configured API endpoint', function(){
			var subject = new DIC.BaseCollection();
			expect(subject.url()).to.eql(DIC.AppConfig.endpoint);
		});
	});

	describe('#retriveItemThen', function(){
		it('Needs to be passed a config object', function(){
			var subject = new DIC.BaseCollection();
			expect(subject.retriveItemThen()).to.eql(false);
		});


		it('Success fires on get returning true', function(done){
			var subject = new DIC.BaseCollection();
			subject.fetch = function(options){ options.success(options.get());};

			subject.retriveItemThen({
				"get": function(){ return 'somedata'; },
				"success": function(data){
					expect(data).to.eql('somedata');
					done();
				}
			});
			
		});
		it('Error fires on get returns false after fetch', function(done){
			var subject = new DIC.BaseCollection();
			subject.fetch = function(options){ options.success();};

			subject.retriveItemThen({
				"success": function(){
					expect(false).to.be.ok;
					done();
				},
				"error": function(){
					expect(true).to.be.ok;
					done();
				}
			});
		});

		it('Dont fetch if data already exists', function(done){
			var subject = new DIC.BaseCollection();

			var fetched = false; 
			subject.fetch = function(options){ 
				options.success(); 
				fetched = true; 
			};

			subject.retriveItemThen({
				"get": function() { return "cheese"; },
				"success": function(){
					expect(fetched).to.be.false;
					done();
				}
			});
		});

		it('Do fetch if data already exists', function(done){
			var subject = new DIC.BaseCollection();

			var fetched = false;
			subject.cake = false;
			subject.fetch = function(options){ 
				fetched = true; 
				options.success(); 
			};

			subject.retriveItemThen({
				"get": function() { return fetched; },
				"success": function(){
					expect(fetched).to.be.true;
					done();
				},
				"error": function(){
					// test fails
					expect(false).to.be.ok;
					done();
				}
			});
		});
	});
});