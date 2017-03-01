define([ 'backbone', 'app/models/content' ], function(Backbone, ContentModel){
	return  Backbone.ModelFactory(ContentModel,{
		type: "audio",

		defaults: {
			title: null,
			transcription: null,
			src: null,
            playing:false,
            canPlay:false,
            currentTime:0,
            duration:0,
            seekPos:null,
            error:false
		},

        timeFormat: {
            showHour: false,
            showMin: true,
            showSec: true,
            padHour: false,
            padMin: true,
            padSec: true,
            sepHour: ":",
            sepMin: ":"
        },

        getTimenowAttribute: function(){
            var $t = this.get('currentTime');
            return this.convertTime($t);
        },

        getTimeleftAttribute: function(){
            var $d = this.get('duration');
            var $t = this.get('currentTime');
            var $r = parseInt($d)-parseInt($t);
            return this.convertTime($r);
        },
        getPlaystateAttribute: function(){
            var $d = this.get('duration');
            var $t = this.get('currentTime');
            return this.convertTime($t) + ' / ' + this.convertTime($d);
        },

        getPlaybackPositionAttribute: function(){
            var $d = this.get('duration');
            var $t = this.get('currentTime');
            return parseInt($t/$d*100);
        },

        convertTime: function(s) {
            var myTime = new Date(parseInt(s) * 1000),
                hour = myTime.getUTCHours(),
                min = myTime.getUTCMinutes(),
                sec = myTime.getUTCSeconds(),
                strHour = (this.timeFormat.padHour && hour < 10) ? "0" + hour : hour,
                strMin = (hour > 0 || (this.timeFormat.padMin && min < 10)) ? "0" + min : min,
                strSec = (this.timeFormat.padSec && sec < 10) ? "0" + sec : sec;
            return ((this.timeFormat.showHour && hour > 0) ? strHour + this.timeFormat.sepHour : "") + ((this.timeFormat.showMin) ? strMin + this.timeFormat.sepMin : "") + ((this.timeFormat.showSec) ? strSec : "");
        },

        initialize: function(){
            
        }
	});
});