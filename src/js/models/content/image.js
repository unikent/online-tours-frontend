define([ 'backbone', 'app/models/content' ], function(Backbone, ContentModel){
    return  Backbone.ModelFactory(ContentModel,{
		type: "image",

		defaults: {
			title: null,
			caption: null,
			copyright: null,
			width: null,
			height: null,
			src: null
		}
	});
});