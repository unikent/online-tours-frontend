define([], function(){
	var e = function(message){ 
		this.message = (message || 'The specified zone is not a Zone'); 
		this.stack = Error().stack; 
	};

	e.prototype = Object.create(Error.prototype); 
	e.prototype.name = 'ZoneIsNotAZoneError';
	e.prototype.constructor = e;

	return e;
});