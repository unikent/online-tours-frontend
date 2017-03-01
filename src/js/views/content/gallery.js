define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_gallery.html'
    ],
    function(Backbone,BaseView, GalleryTemplate){
        return BaseView.extend({

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(GalleryTemplate);
            }

        });
    }
);