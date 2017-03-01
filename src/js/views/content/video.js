define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_video.html'
    ],
    function(Backbone,BaseView, VideoTemplate){
        return BaseView.extend({

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(VideoTemplate);
            }

        });
    }
);