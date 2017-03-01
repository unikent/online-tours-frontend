describe('NotImplementedError', function(){
	var DIC = {};

 	// Jiggery-pokery to make Mocha and RequireJS play nice. Might be a nicer way to handle this? If there is I haven't found it!
	beforeEach(function(done){
		requirejs([ 'app/errors/not_implemented' ], function(NotImplementedError){
			DIC.NotImplementedError = NotImplementedError;
			done();
		});
	});

	it('is an instance of NotImplementedError', function(){
		var error = new DIC.NotImplementedError();
		expect(error).to.be.an.instanceOf(DIC.NotImplementedError);
	});

	it('is an instance of Error', function(){
		var error = new DIC.NotImplementedError();
		expect(error).to.be.an.instanceOf(Error);
	});

	describe('constructor', function(){
		it('should have a default message', function(){
			var error = new DIC.NotImplementedError();
			expect(error.message).to.equal('The method you called has not been implemented!');
		});

		it('should set the message if provided', function(){
			var error = new DIC.NotImplementedError('Foobar');
			expect(error.message).to.equal('Foobar');
		});
	});

});