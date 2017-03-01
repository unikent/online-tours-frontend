define([], function(){
	var e = function(message){ 
		this.message = (message || 'The method you called has not been implemented!'); 
		this.stack = Error().stack; 
	};

	e.prototype = Object.create(Error.prototype); 
	e.prototype.name = 'NotImplementedError';
	e.prototype.constructor = e;

	return e;
});