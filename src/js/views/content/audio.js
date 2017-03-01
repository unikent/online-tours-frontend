define(
    [
        'backbone',
        'backbone_hammer',
        'hammerjs',
        'app/views/content/content_type',
        'text!app/templates/content_audio.html'
    ],
    function(Backbone, BackboneHammer, Hammer, BaseView, AudioTemplate){
        return BaseView.extend({

            currentHandlePos:0,
            currentHandleDelta:0,
            seekPos:0,
            errored: false,
            events:{
                'click .playtoggle': 'playButton',
                'click .transcription-toggle .show-btn': 'showTranscription',
                'click .transcription-toggle .hide-btn': 'hideTranscription',
                'click .container' : 'elementClicked'
            },

            initialize: function(data){
                this.model = data.model;
                this.poi = data.poi;
                this.contentDraw = data.contentDraw;
                this.template = _.template(AudioTemplate);
                this.on('domReady', this.onDomReady);

                this.listenTo(this.model,'change:playing', this.playToggle);
                this.listenTo(this.model,'change:canPlay', this.playToggle);
                this.listenTo(this.model,'change:currentTime',this.updateTimes);
                this.listenTo(this.model,'change:duration',this.updateTimes);
                this.listenTo(this.model,'change:error',this.handleError);
            },

            onDomReady: function(){
                this.radial_progress = this.$el.find('.radial-progress').first();
                this.radial_progress.attr('data-progress',this.model.get('playbackPosition'));
                this.button = this.$el.find('.playtoggle').first();
                this.timeleft = this.$el.find('.timeleft').first();
                if(this.model.get('currentTime') > 0){
                    this.timeleft.addClass('loaded').html(this.model.get('timeleft'));
                }
            },

            playButton: function(e){
                if(this.model.get('playing')){
                    Backbone.trigger('audio:pause');
                }else{
                    Backbone.trigger('audio:play', this.model, this.poi);
                }
            },

            playToggle: function(){
                if(this.model.get('playing')){
                    if(this.model.get('canPlay')) {
                        this.button.addClass('playing');
                        this.button.removeClass('loading');
                        this.radial_progress.addClass('playing');
                    }else{
                        this.button.addClass('loading');
                        this.button.removeClass('playing');
                        this.radial_progress.removeClass('playing');
                    }
                }else{
                    this.button.removeClass('loading');
                    this.button.removeClass('playing');
                    this.radial_progress.removeClass('playing');
                }
            },

            handleError: function(e){
                if (this.model.get('error')) {
                    console.log("broke");
                    this.radial_progress.addClass('hide');
                    this.$el.find('.error').addClass('show');
                    this.timeleft.addClass("audio-error");
                    this.timeleft.html('Sorry, audio currently unavailable! <a href="#">Retry?</a>');
                }else{
                    console.log("fixed!");
                    this.radial_progress.removeClass('hide');
                     this.timeleft.removeClass("audio-error");
                    this.$el.find('.error').removeClass('show');
                }
            },

            elementClicked: function(e){
                if (this.model.get('error')) {
                    // try and play again
                  Backbone.trigger('audio:play', this.model, this.poi);
                }
            },
            updateTimes: function(){
                var d = this.model.get('duration');
                var t = this.model.get('currentTime');

                this.timeleft.addClass('loaded').html(this.model.get('playstate'));
                this.radial_progress.addClass('loaded');

                var p = parseInt(t/d * 100);
                this.radial_progress.attr('data-progress',p);
            },

            dragHandle: function(e){
                this.audiohandle.addClass('dragging');
                var c = this.timeline.width() -5;
                var h = this.audiohandle[0].offsetLeft;

                var d = e.originalEvent.gesture.deltaX - this.currentHandleDelta;
                this.currentHandleDelta= e.originalEvent.gesture.deltaX;
                var x = h + d;

                this.seekPos = (x >= 0)? ((x >= (c+5))?100:parseInt(x/c *100)): 0;
                this.seekPos = ((this.seekPos < 0)?0:((this.seekPos > 100)?100:this.seekPos));

                if(x < -5){
                    x = -5;
                }
                if(x > c){
                    x = c ;
                }

                this.audiohandle.css('marginLeft',x+'px');
                this.currentHandlePos = x;

                e.preventDefault();
                e.stopPropagation();
                return false;
            },

            handleRelease: function(e){
                this.currentHandleDelta =0;
                this.audiohandle.removeClass('dragging');
                Backbone.trigger('audio:seek',this.model,this.seekPos);
            },

            trackClick: function(e){
                var x = e. offsetX;
                var c = this.timeline.width() -5;

                this.seekPos = (x >= 0)? ((x >= (c+5))?100:parseInt(x/c *100)): 0;
                this.seekPos = ((this.seekPos < 0)?0:((this.seekPos > 100)?100:this.seekPos));
                Backbone.trigger('audio:seek',this.model,this.seekPos);
            },

            hideTranscription: function () {
                this.$('.transcription').slideUp(200);
                this.$('.transcription-toggle .hide-btn').hide();
                this.$('.transcription-toggle .show-btn').show();
            },

            showTranscription: function () {
                this.$('.transcription').slideDown(200);
                this.$('.transcription-toggle .show-btn').hide();
                this.$('.transcription-toggle .hide-btn').show();
            }
        });
    }
);