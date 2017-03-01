define(
    [
        'backbone',
        'backbone_hammer',
        'hammerjs',
        'text!app/templates/audio_menu_player.html'
    ],
    function(Backbone, BackboneHammer, Hammer, AudioTemplate){
        return Backbone.View.extend({
            model: null,
            source:null,
            template: null,
            currentHandlePos:0,
            currentHandleDelta:0,
            seekPos:0,
            events:{
                'click .playtoggle': 'playButton',
                'click .gutter,.loading,.current': 'trackClick',
                'click .restart span':'restart',
                'click .close':function(){Backbone.trigger('menu:open');},
                'click .backlink span':'goBack'
            },
            hammerEvents:{
                'pan .handle':'dragHandle',
                'panend .handle': 'handleRelease',
                'swipeup': function(){Backbone.trigger('menu:open');},
            },
            hammerOptions: {
                domEvents:true,
                recognizers: [
                    [Hammer.Pan, {direction: Hammer.DIRECTION_HORIZONTAL}],
                    [Hammer.Swipe,{ direction: Hammer.DIRECTION_ALL, velocity: 0.4},['pan']],
                ]
            },

            initialize: function(data){
                this.model = data.model;
                this.source = data.source;
                this.template = _.template(AudioTemplate);
                this.on('domReady',this.onDomReady);

                this.listenTo(this.model,'change:playing',this.playToggle);
                this.listenTo(this.model,'change:canPlay',this.playToggle);
                this.listenTo(this.model,'change:currentTime',this.updateTimes);
                this.listenTo(this.model,'change:duration',this.updateTimes);
            },

            onDomReady: function(){
                this.button = this.$el.find('.playtoggle').first();
                this.timeline = this.$el.find('.timeline').first();
                this.current = this.$el.find('.current').first();
                this.current.width(this.model.get('playbackPosition')+'%');
                this.audiohandle = this.$el.find('.handle').first();
                this.timenow = this.$el.find('.timenow').first();
                this.timeleft = this.$el.find('.timeleft').first();
                this.backLink = this.$el.find('.backlink').first();
                if(this.model.get('currentTime') > 0){
                    this.timenow.addClass('loaded').html(this.model.get('timenow'));
                    this.timeleft.addClass('loaded').html('-'+this.model.get('timeleft'));
                }
            },

            playButton: function(e){
                if(this.model.get('playing')){
                    Backbone.trigger('audio:pause');
                }else{
                    Backbone.trigger('audio:play',this.model, this.poi);
                }
            },

            playToggle: function(){
                if(this.model.get('playing')){
                    if(this.model.get('canPlay')) {
                        this.button.addClass('playing');
                        this.button.removeClass('loading').css('line-height','inherit');
                    }else{
                        this.button.addClass('loading').css('line-height',this.button.width()+'px');
                        this.button.removeClass('playing');
                    }
                }else{
                    this.button.removeClass('loading').css('line-height','inherit');
                    this.button.removeClass('playing');
                }
            },

            updateTimes: function(){

                this.timenow.addClass('loaded').html(this.model.get('timenow'));
                this.timeleft.addClass('loaded').html('-' + this.model.get('timeleft'));

                var p = this.model.get('playbackPosition');

                this.current.width( p + '%');
                if(!this.audiohandle.hasClass('dragging')) {
                    this.audiohandle.css('marginLeft', '100%');
                }

            },

            dragHandle: function(e){
                this.audiohandle.addClass('dragging');
                var c = this.timeline.width() -6;
                var h = this.audiohandle[0].offsetLeft;

                var d = e.originalEvent.gesture.deltaX - this.currentHandleDelta;
                this.currentHandleDelta= e.originalEvent.gesture.deltaX;
                var x = h + d;

                this.seekPos = (x >= 0)? ((x >= (c+5))?100:parseInt(x/c *100)): 0;
                this.seekPos = ((this.seekPos < 0)?0:((this.seekPos > 100)?100:this.seekPos));

                if(x < -6){
                    x = -6;
                }
                if(x > c){
                    x = c ;
                }

                //console.log(c, h, d, x, this.seekPos);

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
                var c = this.timeline.width() -6;

                this.seekPos = (x >= 0)? ((x >= (c+6))?100:parseInt(x/c *100)): 0;
                this.seekPos = ((this.seekPos < 0)?0:((this.seekPos > 100)?100:this.seekPos));
                Backbone.trigger('audio:seek',this.model,this.seekPos);
            },

            restart: function(){
                Backbone.trigger('audio:seek',this.model,0);
            },

            goBack: function(){
                Backbone.trigger('menu:open');
                window.app.navigate(this.backLink.find('span').first().attr('data-url'),  true );
            },

            render: function(){
                if(typeof this.model !== 'undefined' && typeof this.template === 'function') {
                    this.$el.html(this.template($.extend(this.model.attributes,{
                        backlink:window.location.pathname.replace(Backbone.history.root,''),
                        backtext:this.source.get('name')
                    })));
                    return this.$el;
                }
                return '';
            }
        });
    }
);