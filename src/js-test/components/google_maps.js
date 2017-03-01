describe('GoogleMapsComponent', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/components/google_maps' ], function(GoogleMapsComponent){
			DIC.GoogleMapsComponent = GoogleMapsComponent;
			done();
		});
	});

	describe('#generateGPolyline', function(){
		it('should generate a google maps polyline object', function(){
			DIC.GoogleMapsComponent.done(function(subject){
			var polyine = [{lat:51,lng:1},{lat:50,lng:2}];
			var gpolyline = subject.generateGPolyline(polyine);
			expect(Object.prototype.toString.call(gpolyline)).to.eql('[object Object]');
			expect(Object.prototype.toString.call(gpolyline.bounds)).to.eql('[object Object]');
			expect(gpolyline.getPath().getArray()[0].lat()).to.eql(51);
			expect(gpolyline.getPath().getArray()[0].lng()).to.eql(1);
			expect(gpolyline.getPath().getArray()[1].lat()).to.eql(50);
			expect(gpolyline.getPath().getArray()[1].lng()).to.eql(2);
			}).fail(function(){
				expect(false).to.be.true;
			});
		});
	});
});