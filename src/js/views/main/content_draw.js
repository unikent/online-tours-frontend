define(
	[
		'backbone',
		'app/models/poi',
		'app/models/tour',
		'backbone_hammer',
		'hammerjs',
		'text!app/templates/content_collection.html',
		'app/views/content/contents'
	],
	function(
		Backbone,
		POIModel,
		TourModel,
		BackboneHammer,
		Hammer,
		contentCollectionTemplate,
		ContentsView
	){
		return Backbone.View.extend({

			position: {
				bounds: {
					top: 0,
					bottom: null
				},

				offsets: {
					top: 50,
					bottom: 115,
					bottomFix: 0
				}
			},

			slideState: null,
			slidePosition: 0,
			slideDelta: 0,


			templates: {},
			subViews: {},
			obj: null,

			events: {
				'click': 'drawClicked',
				'click .draw__header': 'fullscreenDraw',
				'click .draw__handle': 'fullscreenDraw'
			},

			hammerEvents: {
				'swipeup': 'handleSwipeUp',
				'swipedown': 'handleSwipeDown',
				'pan': 'handleDrag',
				'panend': 'handleDragStop',
				'panstart': 'handleDragStart'
			},
			hammerOptions: {
				recognizers: [
					[Hammer.Pan,{ direction: Hammer.DIRECTION_VERTICAL, threshold:10}],
					[Hammer.Swipe,{ direction: Hammer.DIRECTION_ALL, velocity: 0.4},['pan']],
				]
			},

			initialize: function(){

				// Set the viewport bounds
				this.position.bounds.bottom = $("body").height(); // use body element height as IOS can't clientHeight correctly

				// if these are differnt, this is probably IOS which incorrectly
				// reports the viewport height. Calculate the difference between the "real" height
				// and what ios thinks it is, then use this to move elements hidden by IOS's browser bar above it
				if(this.position.bounds.bottom !== document.documentElement.clientHeight){
					this.position.offsets.bottomFix = Math.abs(document.documentElement.clientHeight - this.position.bounds.bottom);
				}

				// Set up template
				this.templates.contentCollection = _.template(contentCollectionTemplate);

				this.listenTo(Backbone,'map:interact',this.collapseDraw);
				this.listenTo(Backbone,'app:resize', this.resize);

				this.render();
			},
			resize: function(){
				// reset bounds
				var newClientHeight =  $("body").height(); 
				this.setSlidePosition(this.slidePosition + (this.position.bounds.bottom - newClientHeight));
				this.position.bounds.bottom = newClientHeight;
			},
			setSlidePosition: function(y){
				this.slidePosition = y;
				this.$el.css('transform', 'translateY(' + y + 'px)');
			},
			setSlideState: function(state){
				if(this.slideState!==state) {

					switch (state) {
						case 'fullscreen':
							this.$el.removeClass('draw--semiscreen draw--collapsed draw--loading');
							this.$el.addClass('draw--fullscreen');
							this.setSlidePosition(0 - this.position.bounds.bottom);
							break;

						case 'semiscreen':
							this.$el.removeClass('draw--fullscreen draw--collapsed draw--loading');
							this.$el.addClass('draw--semiscreen');
							break;

						case 'collapsed':
							this.$el.removeClass('draw--fullscreen draw--semiscreen draw--loading');
							this.$el.addClass('draw--collapsed');
							this.setSlidePosition(0 - (this.position.offsets.bottom + this.position.offsets.bottomFix));
							break;

						default:
							this.$el.removeClass('draw--fullscreen draw--semiscreen draw--collapsed');
							this.$el.addClass('draw--loading');
							break;
					}

					this.slideState = state;
				}
			},

			handleDrag: function(e){
				if(typeof e.gesture ==='undefined'){
					return true;
				}

				var d = e.gesture.deltaY - this.slideDelta;		// Calculate and store delta of this event only
				this.slideDelta = e.gesture.deltaY;

				var y = this.slidePosition + d;					// New position on screen with delta factored in, from bottom...
				y2 = (this.position.bounds.bottom + y);			// ...but t/b are calculated from top: convert y to from top

				var t = (this.position.bounds.top + this.position.offsets.top);
				var b = (this.position.bounds.bottom - this.position.offsets.bottom);

				if(this.contentCollection[0].scrollTop === 0 ) {

					if ((y2 > t) && (y2 < b)) {

						this.setSlideState('semiscreen');
						this.setSlidePosition(y);

					} else if (y2 <= t) {

						this.setSlideState('fullscreen');
						if(e.gesture.direction == Hammer.DIRECTION_UP) {

							this.contentCollection[0].scrollTop = 1;
							//todo: figure out why this fails on ios7

						}else{
							this.setSlideState('semiscreen');
							this.setSlidePosition(0 - this.position.bounds.bottom +  this.position.offsets.top );
						}

					} else if (y2 >= b) {

						this.setSlideState('collapsed');
					}
				}else{
					if(this.slideState=='fullscreen'){
						this.contentCollection[0].scrollTop = this.contentCollection[0].scrollTop - d ;
					}
				}

				// tell ios we are scrolling
				this.contentCollection.trigger('scroll');


				e.preventDefault();
				e.stopPropagation();
				return false;

			},

			handleDragStop: function(e){
				this.slideDelta = 0;
				if(this.slideState=='semiscreen'){
					if(this.slidePosition >= (0- (this.position.bounds.bottom*0.45))){
						if(this.slidePosition > (0- (this.position.bounds.bottom*0.225))) {
							this.setSlideState('collapsed');
						}else{
							this.setSlidePosition(0- (this.position.bounds.bottom*0.45));
						}
					}else{
						if(this.slidePosition > (0- (this.position.bounds.bottom*0.7))) {
							this.setSlidePosition(0- (this.position.bounds.bottom*0.45));
						}else {
							this.setSlideState('fullscreen');
						}
					}
				}
			},

			handleDragStart: function(e){
			},

			handleSwipeUp: function(e){
				this.setSlideState('fullscreen');

				// Collapase both menu's
				Backbone.trigger('menu:open');

			},

			handleSwipeDown: function(e){
				if(this.contentCollection.scrollTop()<2) {
					this.setSlideState('collapsed');
				}

				// Collapase both menu's
				Backbone.trigger('menu:open');
			},

			collapseDraw: function(){
				this.setSlideState('collapsed');
			},

			fullscreenDraw: function(){
				this.setSlideState('fullscreen');
			},

			/**
			 * Iterates through the contents of a POI or Tour object and displays each with the correct view
			 */
			render: function(obj){

				var $this = this;
				var html = '';


				this.setSlideState();
				this.setSlidePosition((0 - this.position.offsets.bottom));
				
				if (obj) {

					var disabledgourl = obj instanceof POIModel ? obj.get('location').disabled_go_url:false;

					html += $this.templates.contentCollection({
						title: typeof obj.get('name') !== 'undefined' && obj.get('name') !== '' ? obj.get('name') : 'Oops...',
						disabledgo: disabledgourl
					});

					this.$el.html(html);
					this.contentCollection = this.$el.find('.content__collection').first();
					var contentList = this.contentCollection.find('.content__list .content__main').first();

					if(typeof this.subViews.contents !== 'undefined'){
						this.subViews.contents.cleanup();
					}

					this.subViews.contents = new ContentsView({el:contentList,obj:obj});

					this.setSlideState('semiscreen');
					this.setSlidePosition(0- (this.position.bounds.bottom*0.45));

					// scroll to top
					this.contentCollection.scroll(function(){
						if ($(this).scrollTop() > 200) {
							$('.scroll-to-top').fadeIn();
						} else {
							$('.scroll-to-top').hide();
						}
					});


					this.contentCollection.find('.scroll-to-top').click(function () {
						$this.contentCollection.scrollTop(0);
					});

				}else{
					this.setSlideState();
				}

			},

			drawClicked: function(e){
				// Collapase both menu's
				Backbone.trigger('menu:open');

				if(this.slideState=='fullscreen'){
					if(e.pageY <= 90){
						this.setSlideState('collapsed');
					}
				}else{
					if(e.offsetY<0){
						this.setSlideState('fullscreen');
					}
				}
			}
		});
	}
);