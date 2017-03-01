define(
    [
        'backbone', 
        'app/views/audio_menu_player'
    ],
    function(Backbone, AudioView){
        return Backbone.View.extend({
            open: false,

            subviews: {},
            widgit: false,
            icon: false,
            backLink: false,
            // Animate icon
            audio_animation: ["kf-volume-mute","kf-volume-low","kf-volume-medium","kf-volume-high"],
            audio_tick: 0,

            events: {
                "click .back-link span": "goBack"
            },
            initialize: function(){

                this.icon = $(".control-audio");
                this.backLink = $(".back-link span");

                this.listenTo(Backbone,'menu:open', this.hide);
                this.listenTo(Backbone,'map:interact', this.hide);
                this.listenTo(Backbone,'audio:play', this.playAudio);
                this.listenTo(Backbone,'audio:pause', this.pauseAudio);
                this.listenTo(Backbone,'audio:ended', this.pauseAudio);
                this.listenTo(Backbone,'map:exit', this.removeAudioWidget);
                this.listenTo(Backbone,'audio:error', this.destroyAudio);
            },
            createAudioWidgit: function(audio_model, source_model){
                // Create new audio widgit
                this.widget = $('<div class="audio-menu-content"></div>');
                this.$el.prepend(this.widget);

                //this.backLink.text("Back to " + source_model.get('name'));
                //this.backLink.attr('data-url', window.location.pathname.replace(Backbone.history.root,''));

                this.subviews.audio = new AudioView({el: this.widget, model: audio_model, source:source_model});
                this.subviews.audio.render();
                this.subviews.audio.trigger('domReady');
                 
                // Show icon
                this.icon.show();
            },

            playAudio: function(audio_model, source_model){

                // Check if audio source exists and it has changed?
                if(this.subviews.audio && audio_model.cid !== this.subviews.audio.model.cid){
                    this.destroyAudio();
                }

                // Setup audio player
                if(!this.subviews.audio){
                    this.createAudioWidgit(audio_model, source_model);
                }
                
                var $this = this;
                // nuke any existing loop
                clearInterval(this.icon.loop);
                // Start "now playing" animation
                this.icon.loop = setInterval(function(){
                    
                    var _old = $this.audio_animation[ ($this.audio_tick % 3) ];
                    $this.audio_tick++;
                    var _new = $this.audio_animation[ ($this.audio_tick % 3) ]; 
        
                    $this.icon.removeClass(_old);
                    $this.icon.addClass(_new);

                },400);
            },

            pauseAudio: function(){
                // Pause now playing animation
                clearInterval(this.icon.loop);
            },

            destroyAudio: function () {
                this.subviews.audio.remove();
                this.subviews.audio = false;
                this.icon.hide();
            },

            render: function(){
                Backbone.trigger('menu:open');
                // Show menu & update dynamic buttons
                if(this.widget) {
                    this.widget.addClass('open');
                    this.open = true;
                }
            },

            hide: function(){
                // Hide menu again
                if(this.widget) {
                    this.widget.removeClass('open');
                    this.open = false;
                }
            },

            toggle: function(){
                // toggle menu
                if(this.open){
                    this.hide();
                }else{
                    this.render();
                }
            }
           
        });
    }
);