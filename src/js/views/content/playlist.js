define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_playlist.html'
    ],
    function(Backbone,BaseView, PlaylistTemplate){
        return BaseView.extend({

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(PlaylistTemplate);
            }

        });
    }
);