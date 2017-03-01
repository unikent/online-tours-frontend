define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_pano.html'
    ],
    function(Backbone,BaseView, PanoTemplate){
        return BaseView.extend({

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(PanoTemplate);
            }

        });
    }
);