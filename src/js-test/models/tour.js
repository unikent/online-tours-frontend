describe('TourModel', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/models/tour', 'app/collections/pois', 'app/models/poi'], function(TourModel, POICollection, POIModel){
			DIC.TourModel = TourModel;
            DIC.POICollection = POICollection;
            DIC.POIModel = POIModel;
			done();
		});
	});


    describe('default attributes', function(){
        it('default attributes initialize to null', function(){
            var subject = new DIC.TourModel();
            expect(subject.get('name')).to.be.null;
            expect(subject.get('description')).to.be.null;
            expect(subject.get('distance')).to.be.null;
            expect(subject.attributes.duration).to.be.null;
            expect(subject.get('polyline')).to.be.null;
            expect(subject.get('items')).to.be.null;
        });
    });

    describe('#initialize', function(){

        it('initializes a POICollection', function(){
            var subject = new DIC.TourModel();
            expect(subject.pois).to.be.an.instanceOf(DIC.POICollection);
        });

        it('.pois is empty by default', function(){
            var subject = new DIC.TourModel();
            expect(subject.pois).to.have.length(0);
        });

    });
    
    describe('#loadPOIs', function(){
        it('populates pois collection with POI models based on `items` ID list', function(){
            var subject = new DIC.TourModel();
            subject.set('items',[1,3,4]);
            subject.loadPOIs();
            expect(subject.pois).to.have.length(3);
        });

        it('gets existing POI models from the model factory', function(){
            var subject = new DIC.TourModel();
            var poi = new DIC.POIModel({id:1,location:{name:"test"}});
            poi = new DIC.POIModel({id:3,location:{name:"test3"}});
            subject.set('items',[1,3,4]);
            subject.loadPOIs();
            expect(subject.pois.get({id:1}).get('location').name).to.eql("test");
            expect(subject.pois.get({id:3}).get('location').name).to.eql("test3");
            expect(subject.pois.get({id:4}).get('location').name).to.be.null;
        });
    });

    describe('#getPolylineobjAttribute', function(){
        it('gets the polyline as an object array if polyline is array of array', function(){
            var subject = new DIC.TourModel();
            subject.set({polyline: '[[{"lat":51,"lng":1},{"lat":50,"lng":2}]]'});
            var polylineobj = subject.get('polylineobj');
            expect(Object.prototype.toString.call(polylineobj) === '[object Array]' ).to.be.true;
            expect(polylineobj[0].lat).to.eql(51);
            expect(polylineobj[1].lat).to.eql(50);
            expect(polylineobj.length).to.eql(3);
        });

        it('gets the polyline as an object array if polyline is array', function(){
            var subject = new DIC.TourModel();
            subject.set({polyline: '[{"lat":51,"lng":1},{"lat":50,"lng":2}]'});
            var polylineobj = subject.get('polylineobj');
            expect(Object.prototype.toString.call(polylineobj) === '[object Array]' ).to.be.true;
            expect(polylineobj[0].lat).to.eql(51);
            expect(polylineobj[1].lat).to.eql(50);
            expect(polylineobj.length).to.eql(3);
        });

        it('returns an empty object if no polyline set', function(){
            var subject = new DIC.TourModel();
            var polylineobj = subject.get('polylineobj');
            expect(Object.prototype.toString.call(polylineobj) === '[object Array]' ).to.be.true;
            expect(polylineobj.length).to.eql(0);
        });

        it('returns an empty object if empty polyline set', function(){
            var subject = new DIC.TourModel();
            subject.set({polyline: ''});
            var polylineobj = subject.get('polylineobj');
            expect(Object.prototype.toString.call(polylineobj) === '[object Array]' ).to.be.true;
            expect(polylineobj.length).to.eql(0);
        });
    });

    describe('#parse', function(){
        it('populates .pois, if children in the response', function(){
            var subject = new DIC.TourModel();
            expect(subject.pois).to.have.length(0);

            subject.parse({ children: [ { id: 3 }, { id: 4 }, { id: 5} ]});
            expect(subject.pois).to.have.length(3);
        });

        it('populates .pois recursively, if pio\'s have children', function(){
            var subject = new DIC.TourModel();
            expect(subject.pois).to.have.length(0);

            subject.parse({ children: [ { id: 3, children:[ { id: 6}, { id: 7 } ] }, { id: 4 }, { id: 5} ]});
            expect(subject.pois).to.have.length(3);
            expect(subject.pois.get(3).pois).to.have.length(2);
        });

        it('populates .contents, if contents in the response', function(){
            var subject = new DIC.TourModel();
            expect(subject.contents).to.have.length(0);

            subject.parse({ contents: [ { id: 3 }, { id: 4 }, { id: 5} ]});
            expect(subject.contents).to.have.length(3);
        });
    });


    describe('#getDurationAttribute', function(){
       it('stringifies duration value correctly', function(){
           var subject = new DIC.TourModel();
           expect(subject.get('duration')).to.eql('');
           subject.attributes.duration = 45;
           expect(subject.get('duration')).to.eql('45&nbsp;mins');
           subject.attributes.duration = 105;
           expect(subject.get('duration')).to.eql('1&nbsp;hour&nbsp;45&nbsp;mins');
           subject.attributes.duration = 125;
           expect(subject.get('duration')).to.eql('2&nbsp;hours&nbsp;5&nbsp;mins');
       });
    });
});