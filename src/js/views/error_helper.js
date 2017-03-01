define(
	[
		'backbone',
		'app/config',
	], 
	function(Backbone, config){
		return Backbone.View.extend({
			ready: true,
			events: {
				'click button.okay': 'hideError',
				'click button.reload': 'reloadApp',
			},
			flashTimer: null,
			messages: {
				'critical' : "Sorry, we're unable to access our content at the moment. Please check your phone's connectivity and try again.<br />Did you know, kent campus offers free wifi via theCloud?",
				'slow' : "It looks like this request is taking a while. Sorry to keep you waiting."
			},

			initialize: function(){
				// Create self element if not already created
				if ($('body .viewport > .error_helper').length === 0) {
					this.$el = $("<div class='error_helper'></div>");
					this.$el.css('z-index', '1000');
					$("body .viewport").append(this.$el);
				}
				else {
					this.$el = $('body .viewport > .error_helper');
				}

				this.el = this.$el[0];

				this.listenTo(this, 'errorStateChange', this.handleError);
			},
			errors: {
				"slow": [], 
				"critical": []
			},
			createError: function(type, message){

				var $this = this;
				var err = _.extend({}, Backbone.Events);

				err.type = type;
				err.message = (typeof message === 'undefined') ? '' : message;

				this.errors[type].push(err);
				var cake = this.errors[type];

				err.on("clear", function(){

					$this.errors[this.type] = _.without($this.errors[this.type], this);

					// remove error from array
					$this.trigger("errorStateChange");
				});

				window.err = this.errors;

				this.trigger("errorStateChange");
				return err;
			},

			handleError: function(){
				// error state has changed
				var err = false;

				if(this.errors.critical.length !== 0 ){
					err = this.errors.critical[this.errors.critical.length-1];
				}else if(this.errors.slow.length !== 0 ){
					err = this.errors.warn[this.errors.slow.length-1];
				}
				// an error was found?
				if(err){
					this.showError(err);
				}else{
					this.hideError();
				}
			},

			showError:function(err){
				// get default message if none provided
				var message = (err.message === '') ? this.messages[err.type] : err.message;
				var html = '';

				// Generate critical error
				if(err.type === 'critical'){
					html += '<h3>Oops!</h3>';
					html += '<p>' + message + '</p>';
					html += '<button class="reload">Reload</button>';
					this.$el.html(html);
				}else if(err.type === 'slow'){
					html += '<h3>Sorry!</h3>';
					html += '<p>' + message + '</p>';
					html += '<button class="okay">Okay</button>';
					this.$el.html(html);
				}
				
				this.$el.css("transform", "translateY(-70vh)");
			},
			hideError: function(){
				this.$el.css("transform", "translateY(50vh)");
			},
			reloadApp: function(){
				var fragment = window.app._getUpFragment();
				// try and go up a level if it breaks badly - if not just refresh (maybe we are at root?)
				if(fragment){
					window.location = config.baseUrl + fragment;
				}else{
					window.location.reload();
				}
				
			}

		});
	}
);