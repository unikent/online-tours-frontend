define([], function(){
    var e = function(message){
        this.message = (message || 'The specified model is not an Audio');
        this.stack = Error().stack;
    };

    e.prototype = Object.create(Error.prototype);
    e.prototype.name = 'ModelIsNotAnAudio';
    e.prototype.constructor = e;

    return e;
});