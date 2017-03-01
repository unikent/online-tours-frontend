define([ 'backbone', 'app/models/content' ], function(Backbone, ContentModel){
    return  Backbone.ModelFactory(ContentModel,{
		type: "text"
	});
});