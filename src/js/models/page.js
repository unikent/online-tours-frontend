define([ 'app/config', 'app/models/base', 'app/collections/content' ], function(AppConfig, BaseModel, ContentCollection){
    return Backbone.ModelFactory(BaseModel, {
        defaults: {
            title: null,
        },

        getNameAttribute: function(){
            return this.get('title');
        },

        initialize: function(){
            this.contents = (this.contents || new ContentCollection());
        },

        parse: function(resp, options){
            this.contents = (this.contents || new ContentCollection());
            if(resp.contents && (resp.contents.length > 0)){
                this.contents.reset(resp.contents,{parse:true});
            }

            return resp;
        },

        url: function(){
            return AppConfig.endpoint + '/page/' + this.get('id');
        }

    });
});