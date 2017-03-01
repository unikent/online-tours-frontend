define(['backbone'],
function(Backbone){
	return Backbone.View.extend({
		currentAudioModel: false,
		initialize: function(){
			// set audio element
			this.el = new Audio();

			// Handle audio events from app
			this.listenTo(Backbone,'audio:canplay',this.canPlay);
			this.listenTo(Backbone,'audio:play',this.playAudio);
			this.listenTo(Backbone,'audio:pause',this.pauseAudio);
			this.listenTo(Backbone,'audio:ended',this.endedAudio);
			this.listenTo(Backbone,'audio:timeupdate', this.updateAudioTime);
			this.listenTo(Backbone,'audio:durationchange', this.updateAudioDuration);
			this.listenTo(Backbone,'audio:seek', this.seekAudio);
			this.listenTo(Backbone,'audio:error', this.handleAudioError);

			// handle events from audio el
			this.el.addEventListener('canplay',function(){
				Backbone.trigger('audio:canplay');
			});
			this.el.addEventListener('ended',function(){
			   Backbone.trigger('audio:ended');
			});
			this.el.addEventListener('error',function(){
				Backbone.trigger('audio:error');
			});
			this.el.addEventListener('timeupdate',function(){
				Backbone.trigger('audio:timeupdate');
			});
			this.el.addEventListener('durationchange',function(){
				Backbone.trigger('audio:durationchange');
			});
		},
		updatePlayer: function(newAudioModel){

			// Clean up previously playing audio
			if(this.currentAudioModel){
				// Pause audio
				this.el.pause();
				// Tell old model its no longer playing
				this.currentAudioModel.set('playing', false);
			}
			
			// get source
			var src = false;
			if (typeof newAudioModel.get('src').mp3 !== 'undefined' && !!(this.el.canPlayType && this.el.canPlayType('audio/mpeg;').replace(/no/, ''))) {
				src = newAudioModel.get('src').mp3;
			} else if (typeof newAudioModel.get('src').ogg !== 'undefined' && !!(this.el.canPlayType && this.el.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ''))) {
				src = newAudioModel.get('src').ogg;
			} else if (typeof newAudioModel.get('src').wav !== 'undefined' && !!(this.el.canPlayType && this.el.canPlayType('audio/wav; codecs="1"').replace(/no/, ''))) {
				src = newAudioModel.get('src').wav;
			}

			// load audio
			if (src) {
				this.el.src = src;
				this.el.load();
				this.el.currentTime = newAudioModel.get('currentTime');
				Backbone.trigger('audio:ready');
			}else{
				Backbone.trigger('audio:error');
			}

			// set new current model
			this.currentAudioModel = newAudioModel;
		},
		attemptReload: function(){
			// If audio fails, attempt to reload
			this.el.load();
		},
		playAudio: function(newAudioModel){
			// change audio
			if(this.currentAudioModel !== newAudioModel) {
				this.updatePlayer(newAudioModel);
			}

			// handle errored audio
			if(this.currentAudioModel.get("error")){
				// try a reload
				this.attemptReload();	
			}

			// try and play
			this.el.play();

			// If everything is good, say we are playing!
			Backbone.trigger('audio:start');
			this.currentAudioModel.set('error', false);
			this.currentAudioModel.set('playing', true);
		},
		pauseAudio: function(){
			this.currentAudioModel.set('playing', false);
			this.el.pause();
		},
		endedAudio: function(){
			this.currentAudioModel.set('playing', false);
			this.currentAudioModel.set('currentTime', 0);
			this.el.pause();
		},
		canPlay: function(){
			this.currentAudioModel.set('canPlay', true);
		},
		updateAudioDuration: function(){
			this.currentAudioModel.set('duration', this.el.duration);

			if(this.currentAudioModel.get('seekPos') !== null){
				var pos = parseInt((this.currentAudioModel.get('duration')/100)*this.currentAudioModel.get('seekPos'));
				this.el.currentTime = pos;
				this.currentAudioModel.set('currentTime', pos);
				this.currentAudioModel.set('seekPos', null);
			}
		},
		updateAudioTime: function(){
			this.currentAudioModel.set('currentTime', this.el.currentTime);
		},
		seekAudio:function(audio, position){
			var pos =0;
			if(this.currentAudioModel == audio) {
				pos = parseInt((this.currentAudioModel.get('duration')/100)*position);
				this.el.currentTime = pos;
				this.currentAudioModel.set('currentTime',pos);
			}else{
				if(audio.get('duration')>0){
					pos = parseInt((audio.get('duration')/100)*position);
					audio.set('currentTime',pos);
				}else {
					audio.set('seekPos',position);
				}
			}
		},
		handleAudioError: function () {
			this.currentAudioModel.set('playing', false);
			this.currentAudioModel.set('error', true);
		}		
	});
});