describe('PageModel', function(){
    var DIC = {};

    beforeEach(function(done){
        requirejs([ 'app/config', 'app/models/page','app/collections/content' ], function(AppConfig, PageModel, ContentCollection){
            DIC.AppConfig = AppConfig;
            DIC.PageModel = PageModel;
            DIC.ContentCollection = ContentCollection;
            done();
        });
    });


    describe('default attributes', function(){
        it('default attributes initialize correctly', function(){
            var subject = new DIC.PageModel();
            expect(subject.get('title')).to.be.null;
        });
    });

    describe('#initialize', function(){

        it('initializes a ContentCollection', function(){
            var subject = new DIC.PageModel();
            expect(subject.contents).to.be.an.instanceOf(DIC.ContentCollection);
        });

        it('.contents is empty by default', function(){
            var subject = new DIC.PageModel();
            expect(subject.contents).to.have.length(0);
        });

    });

    describe('#parse', function(){

        it('populates .contents, if contents in the response', function(){
            var subject = new DIC.PageModel();
            expect(subject.contents).to.have.length(0);

            subject.parse({ contents: [ { id: 3 }, { id: 4 }, { id: 5} ]});
            expect(subject.contents).to.have.length(3);
        });

    });

    describe('#url', function(){
        it('returns the correct API endpoint', function(){
            var subject = new DIC.PageModel({id:666});
            expect(subject.url()).to.eql(DIC.AppConfig.endpoint + '/page/666');
        });
    });

});