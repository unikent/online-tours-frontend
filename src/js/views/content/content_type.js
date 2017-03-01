define(
    [
        'backbone',
        'backbone_hammer',
        'hammerjs'
    ],
    function(Backbone,BackboneHammer,Hammer){
        return Backbone.View.extend({
            model: null,
            template: null,
            events: {
            },
            initialize: function(data){
                this.model = data.model;
                this.contentDraw = data.contentDraw;
            },

            render: function(){
                if(typeof this.model !== 'undefined' && typeof this.template === 'function') {
                    this.$el.html(this.template(this.model.attributes));
                    return this.$el;
                }
                return '';
            }

        });
    }
);