define([ 'app/collections/base', 'app/models/content','app/models/content/audio','app/models/content/image', 'app/models/content/text', 'app/models/content/video' ], function(BaseCollection, ContentModel, AudioModel, ImageModel,TextModel,VideoModel){
	return BaseCollection.extend({
		model: ContentModel,

        parse: function(response){
            var self = this;
            _.each(response, function(c){
                switch(c.type) {
                    case 'audio':
                        self.add(new AudioModel(c));
                        break;
                    case 'image':
                        self.add(new ImageModel(c));
                        break;
                    case 'text':
                        self.add(new TextModel(c));
                        break;
                    case 'video':
                        self.add(new VideoModel(c));
                        break;
                    default:
                        self.add(new ContentModel(c));
                        break;
                }
            });
        }

	});
});