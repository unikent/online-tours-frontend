describe('ToursCollection', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/collections/tours', 'app/models/zone', 'app/config' ], function(ToursCollection, ZoneModel, AppConfig){
			DIC.ToursCollection = ToursCollection;
			DIC.ZoneModel = ZoneModel;
			DIC.AppConfig = AppConfig;
			done();
		});
	});

	// INCOMPLETE
	describe('#parse', function(){
		it('retuns tour models', function(){
			var subject = new DIC.ToursCollection();
			//expect(subject).to.have.length(0);

			var tours = subject.parse({ root: { id: 3 }, tours: [{ id: 4 }, { id: 5}] });
			expect(tours).to.have.length(2);
			expect(tours[0].id).to.be.eql(4);
		});
	});

	// INCOMPLETE
	describe('#url', function(){
		it('uses its zone\'s id to form the correct url', function(){
			var zone = new DIC.ZoneModel({id: 15});
			expect(typeof zone.tours.zone === 'undefined').to.be.true;
			zone.parse({tours: [{ id: 4 }, { id: 5}]}, {});
			expect(typeof zone.tours.zone === 'undefined').to.be.false;
			var url = zone.tours.url();
			expect(url).to.be.eql(DIC.AppConfig.endpoint + '/zone/15/tours');
		});

	});
});