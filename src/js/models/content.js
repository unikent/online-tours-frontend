define([ 'backbone', 'app/models/base' ], function(Backbone, BaseModel){
	return Backbone.ModelFactory(BaseModel, {

		defaults: {
			type: null,
			name: null
		}
		
	});
});