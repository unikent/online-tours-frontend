describe('App', function(){
	var DIC = {};

	var makeAppInstance = function(){

		// make pretend audio element since phantom doesn't impliment this tag
		if(!window.Audio) window.Audio = function(){return document.createElement("span");};

		// Create fake collection
		var collection = new DIC.ZoneCollection();
		collection.fetch = function(options){ return options.success(); };

		// Save the prototype
		var prototype = DIC.$.extend(true, {}, DIC.AppController.prototype);

		// Provide "fake" base collection & stop init from doing its normal work
		DIC.AppController.prototype.initialize = function(){
			this.zones = collection;
			this.errorHelper = { flashNotice:function(){}, createError:function(){} };
			this.initPages();
		};

		var app = new DIC.AppController();

		// put it back how it was
		DIC.AppController.prototype = prototype;
		return app;
	};

 	// Jiggery-pokery to make Mocha and RequireJS play nice. Might be a nicer way to handle this? If there is I haven't found it!
	beforeEach(function(done){
		requirejs([ 'app/config', 'jquery', 'app/controllers/app', 'app/collections/zones', 'app/errors/not_implemented', 'app/errors/zone_is_not_a_zone' ], function(AppConfig, $, AppController, ZoneCollection, NotImplementedError, ZoneIsNotAZoneError){
			DIC.AppConfig = AppConfig;
			DIC.AppController = AppController;
			DIC.NotImplementedError = NotImplementedError;
			DIC.ZoneIsNotAZoneError = ZoneIsNotAZoneError;
			DIC.ZoneCollection = ZoneCollection;
			DIC.$ = $;

			done();
		});
	});

	describe('#init', function(){
		it('boot an instance of appController', function(){
			var app = makeAppInstance();
			// As empty "zones" model
			expect(app.zones).have.length(0);
		});
		it('App has correct amount of pages', function(){
			var app = makeAppInstance();
			// As empty "zones" model
			expect(app.pages).have.length(6);
		});
	});

	describe('_setCurrentZone', function(){
		it('return true if we set the currentZone', function(){
			var app = makeAppInstance();
			app.zones.reset([{id:1}]);

			var model = app.zones.first();

            //stub fetch to prevent request
            model.fetch =function(){
                return true;
            };

            expect(app._setCurrentZone(model)).to.be.ok;
		});

		it('return false if it is already the currentZone (ignore request)', function(){
			var app = makeAppInstance();
			app.zones.reset([{id:1}]);

			var model = app.zones.first();
			app.currentZone = model;

			expect(app._setCurrentZone(model)).to.not.be.ok;

		});

	});

	describe('_exitCurrentTour', function(){
		it('set currentTour to null', function(){
			var app = makeAppInstance();
			
			app.currentTour = "cake";
			app._exitCurrentTour();
            expect(app.currentTour).to.be.null;
		});

		it('fires event, tour:end', function(done){
			var app = makeAppInstance();
			app.currentTour = "cake";

			Backbone.listenToOnce(Backbone,"tour:end", function(){
				done();
			});

			app._exitCurrentTour();
		})
	});



	describe('_getCurrentZone', function(){

		it('Needs to be passed a config object', function(){
			var app = makeAppInstance();
			expect(app._getCurrentZone()).to.eql(false);
		});


		it('Fire error if no zone set, and no slug passed', function(done){
			var app = makeAppInstance();

			app._getCurrentZone({
				"success": function(zone){
					expect(false).to.be.ok;
					done();
				},
				"error": function(){
					expect(true).to.be.ok;
					done();
				}
			});
			
		});

		it('Fire success if zone is already set', function(done){
			var app = makeAppInstance();
			app.currentZone = "test";
			app._getCurrentZone({
				"success": function(zone){
					expect(zone).to.eql(app.currentZone);
					done();
				},
				"error": function(){
					expect(false).to.be.ok;
					done();
				}
			});
		});

		it('Lookup slug if zone is not set, but slug is passed. Ensure fetch is fired', function(done){
			var app = makeAppInstance();
			var fetched = false;
			var zone_set = false;
			
			app.zones.findWhere = function(options){
				if(fetched) return (options.slug === 'bacon') ? 'fakeobj' : null;
				return null;
			};

			app._setCurrentZone = function(){
				zone_set = true;
			};
			app.zones.fetch = function(options){ 
				fetched = true; 
				options.success(); 
			};

			app._getCurrentZone({
				"success": function(zone){

					expect(zone).to.eql("fakeobj");
					expect(zone_set).to.eql(true);
					expect(fetched).to.eql(true);
					done();
				},
				"error": function(){
					expect(false).to.be.ok;
					done();
				},
				"slug": "bacon"
			});
		});

	});

	describe('_getUpFragment', function(){

		it('Returns the right url', function(){
			var app = makeAppInstance();
			var originalGetFragment = Backbone.history.getFragment;

			Backbone.history.getFragment = function () {
				return 'map/canterbury/poi/16';
			}
			expect(app._getUpFragment()).to.eql('map/canterbury/poi');

			expect(app._getUpFragment('map/canterbury/poi/16/')).to.eql('map/canterbury/poi');

			Backbone.history.getFragment = function () {
				return '/';
			}
			expect(app._getUpFragment()).to.eql('');

			expect(app._getUpFragment('')).to.eql('');

			// restore
			Backbone.history.getFragment = originalGetFragment;
		});

		it('Returns home url when there is no handler', function(){
			var app = makeAppInstance();

			app._fragmentHasHandler = function (argument) {
				return false;
			}
			expect(app._getUpFragment('map/canterbury/poi/16/')).to.eql('');
		});
	});
});