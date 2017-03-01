define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_image.html'
    ],
    function(Backbone,BaseView, ImageTemplate){
        return BaseView.extend({

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(ImageTemplate);
            },

        });
    }
);