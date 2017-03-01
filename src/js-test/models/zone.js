describe('ZoneModel', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/config', 'app/models/zone', 'app/collections/tours', 'app/collections/pois' ], function(AppConfig,ZoneModel, ToursCollection, POICollection){
			DIC.AppConfig = AppConfig;
            DIC.ZoneModel = ZoneModel;
			DIC.ToursCollection = ToursCollection;
			DIC.POICollection = POICollection;

			done();
		});
	});


	describe('name attribute', function(){
		it('initializes to null', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.get('name')).to.be.null;
		});
	});

	describe('#initialize', function(){
		it('initializes a ToursCollection', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.tours).to.be.an.instanceOf(DIC.ToursCollection);
		});

		it('.tours is empty by default', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.tours).to.have.length(0);
		});

        it('initializes a POICollection', function(){
            var subject = new DIC.ZoneModel();
            expect(subject.pois).to.be.an.instanceOf(DIC.POICollection);
        });

        it('.pois is empty by default', function(){
            var subject = new DIC.ZoneModel();
            expect(subject.pois).to.have.length(0);
        });
	});


	describe('#parse', function(){
		it('populates .tours, if present in the response', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.tours).to.have.length(0);

			subject.parse({ tours: [ { id: 1 }, { id: 2 } ]});
			expect(subject.tours).to.have.length(2);
		});

		it('populates .pois, if present in the response', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.pois).to.have.length(0);

			subject.parse({ pois: [ { id: 1 }, { id: 2 } ]});
			expect(subject.pois).to.have.length(2);
		});

		it('sets tours.zone', function(){
			var subject = new DIC.ZoneModel();
			expect(subject.pois).to.have.length(0);

			subject.parse({});
			expect(subject.tours.zone.id).to.be.eql(subject.id);
		});
	});

    describe('#url', function(){
        it('returns the correct API endpoint', function(){
            var subject = new DIC.ZoneModel({id:666});
            expect(subject.url()).to.eql(DIC.AppConfig.endpoint + '/zone/666');
        });
    });

    describe('#getChildPOIs', function(){
        it('Empty poi collection returns empty array', function(){
            var subject = new DIC.ZoneModel();
        	expect(subject.getChildPOIs()).to.have.length(subject.pois.length)
        });
         it('Zone returns children POI\'s', function() {
             var subject = new DIC.ZoneModel();
             // populate pois
             subject.parse({pois: [{id: 1, children: [{id: 2}, {id: 3}]}]});

             expect(subject.getChildPOIs()).to.have.length(2);
         });
    });

    describe('#populateTours', function(){
        it('populates all tours with their relevant pois', function(){
            var subject = new DIC.ZoneModel();
            subject.parse({ tours: [ { id: 1, items:[1,99] }, { id: 2 } ]});

            //this parse should trigger populateTours when the zones pois collection fires reset
            subject.parse({ pois: [{id: 1, children: [{id: 2}, {id: 3, children: [{id: 99, location:{name:"test"}}]}]}]});

            expect(subject.tours.get(1).pois).to.have.length(2);
            expect(subject.tours.get(1).pois.get({id:99}).get('location').name).to.eql('test');
            expect(subject.tours.get(2).pois).to.have.length(0);
        });
    });

});