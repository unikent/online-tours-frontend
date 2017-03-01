define(
    [
        'backbone', 
    ],
    function(Backbone){
        return Backbone.View.extend({
            menu: null,
            events: {
                "click .kf-menu": "toggle_menu",
                "click .control-audio": "toggle_audio_menu",
                "click .kf-kent-horizontal": "logo_click"
            },
            initialize: function(obj){
                this.listenTo(Backbone,'page:show', this.toggleMenu);
            },
            render: function(){
                // Re draw map icons
            },
            "toggle_menu": function(){
                Backbone.trigger('menu:toggle');
            },
            "toggle_audio_menu": function(){
                Backbone.trigger('audiomenu:toggle');
            },
            "logo_click": function(){
                Backbone.trigger('backToMenu');
            },
            toggleMenu: function($data){

                switch($data.id){
                    case 0 :
                        this.$el.addClass('hidden');
                        break;
                    default:
                        this.$el.removeClass('hidden');
                }
            },
        });
    }
);