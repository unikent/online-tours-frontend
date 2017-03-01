describe('POIModel', function(){
	var DIC = {};

	beforeEach(function(done){
		requirejs([ 'app/config', 'app/models/poi','app/collections/pois','app/collections/content' ], function(AppConfig, POIModel, POICollection, ContentCollection){
            DIC.AppConfig = AppConfig;
            DIC.POIModel = POIModel;
            DIC.POICollection = POICollection;
            DIC.ContentCollection = ContentCollection;
			done();
		});
	});


    describe('default attributes', function(){
        it('default attributes initialize correctly', function(){
            var subject = new DIC.POIModel();
            expect(subject.get('slug')).to.be.null;
            $l = subject.get('location');
            expect(subject.get('name')).to.be.null;
            expect($l).to.be.object;
            expect($l.name).to.be.null;
            expect($l.lat).to.be.null;
            expect($l.lng).to.be.null;
            expect($l.polygon).to.be.null;
        });
    });

    describe('#initialize', function(){

        it('initializes a POICollection', function(){
            var subject = new DIC.POIModel();
            expect(subject.pois).to.be.an.instanceOf(DIC.POICollection);
        });

        it('.pois is empty by default', function(){
            var subject = new DIC.POIModel();
            expect(subject.pois).to.have.length(0);
        });

        it('initializes a ContentCollection', function(){
            var subject = new DIC.POIModel();
            expect(subject.contents).to.be.an.instanceOf(DIC.ContentCollection);
        });

        it('.contents is empty by default', function(){
            var subject = new DIC.POIModel();
            expect(subject.contents).to.have.length(0);
        });

    });

    describe('#parse', function(){
        it('populates .pois, if children in the response', function(){
            var subject = new DIC.POIModel();
            expect(subject.pois).to.have.length(0);

            subject.parse({ children: [ { id: 3 }, { id: 4 }, { id: 5} ]});
            expect(subject.pois).to.have.length(3);
        });

        it('populates .pois recursively, if pio\'s have children', function(){
            var subject = new DIC.POIModel();
            expect(subject.pois).to.have.length(0);

            subject.parse({ children: [ { id: 3, children:[ { id: 6}, { id: 7 } ] }, { id: 4 }, { id: 5} ]});
            expect(subject.pois).to.have.length(3);
            expect(subject.pois.get(3).pois).to.have.length(2);
        });

        it('populates .contents, if contents in the response', function(){
            var subject = new DIC.POIModel();
            expect(subject.contents).to.have.length(0);

            subject.parse({ contents: [ { id: 3 }, { id: 4 }, { id: 5} ]});
            expect(subject.contents).to.have.length(3);
        });

    });

    describe('#url', function(){
        it('returns the correct API endpoint', function(){
            var subject = new DIC.POIModel({id:666});
            expect(subject.url()).to.eql(DIC.AppConfig.endpoint + '/poi/666');
        });
    });

    describe('#resetIcon', function(){
        it('should change the icon when focus is changed', function(){
            var subject = new DIC.POIModel();
            subject.set({focus:true});
            expect(subject.get('icon')).to.be.eql('focus');
        });
        it('should change the icon when active is changed', function(){
            var subject = new DIC.POIModel();
            subject.set({active:true});
            expect(subject.get('icon')).to.be.eql('active');
        });
        it('should change the icon when enabled is changed', function(){
            var subject = new DIC.POIModel();
            subject.set({enabled:true});
            expect(subject.get('icon')).to.be.eql('default');
        });
        it('should set the icon to fade when enabled is set to false', function(){
            var subject = new DIC.POIModel();
            subject.set({enabled:false});
            expect(subject.get('icon')).to.be.eql('fade');
        });
        it('should set the icon to focus when enabled is set to false and focus is true', function(){
            var subject = new DIC.POIModel();
            subject.set({enabled:false});
            subject.set({focus:true});
            expect(subject.get('icon')).to.be.eql('focus');
        });
        it('should set the icon to active when enabled is set to false and active is true', function(){
            var subject = new DIC.POIModel();
            subject.set({enabled:false});
            subject.set({active:true});
            expect(subject.get('icon')).to.be.eql('active');
        });
        it('should set the icon to visited when visited is set to true', function(){
            var subject = new DIC.POIModel();
            subject.set({visited:true});
            expect(subject.get('icon')).to.be.eql('visited');
        });
        it('should set the icon to fade when visited is set to true but enabled is set to false', function(){
            var subject = new DIC.POIModel();
            subject.set({visited:true});
            subject.set({enabled:false});
            expect(subject.get('icon')).to.be.eql('fade');
        });
    });

});