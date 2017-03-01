define(
	[
		'backbone',
		'text!app/templates/main_slide_menu.html',
		'backbone_hammer',
		'hammerjs',
	],
	function(Backbone, menu_tpl, BackboneHammer, Hammer){
		return Backbone.View.extend({
			open: false,
            showTourItem:false,
			events: {
				"click ul li": "menu_item_selected"
			},
			hammerEvents: {
				'pan': function(e){	
					e.preventDefault();
					e.stopPropagation();
				 }
			},
			hammerOptions: {
				recognizers: [
					[Hammer.Pan,{ direction: Hammer.DIRECTION_VERTICAL, threshold:10}],
				]
			},




			initialize: function(){
				// Render template and create as "el"
				this.template = _.template(menu_tpl);
				this.$el.html(this.template({}));
				this.el = this.$el[0];

                this.listenTo(Backbone,'page:show', this.updateMenu);
				this.listenTo(Backbone,'map:interact', this.hide);
				this.listenTo(Backbone,'menu:open', this.hide);
				this.listenTo(Backbone,'tour:start', function(){ $('.tour_control').text("Exit this tour");});
				this.listenTo(Backbone,'tour:end', function(){ $('.tour_control').text("Start a tour");} );
			},
			render: function(){
				Backbone.trigger('menu:open');
				// Show menu & update dynamic buttons
				this.$el.slideDown(200);

				this.open = true;
			},
			hide: function(){
				// Hide menu again
				this.$el.slideUp(200);

				this.open = false;
			},
			toggle: function(){
				// toggle menu
				if(this.open){
					this.hide();
				}else{
					this.render();
				}
			},
			menu_item_selected: function(event){
				// Do action
				var target = $(event.target);

				if(target.attr('data-trigger')){
					Backbone.trigger(target.attr('data-trigger'));
				}else{
				   window.app.navigate(target.attr('data-action'),  true );
				}
				// Hide menu
				this.hide();
			},

            updateMenu: function($data){

                switch($data.id){
                    case 3 :
                        this.toggleTourItem(true);
                        break;
                    default:
                        this.toggleTourItem(false);
                }
            },

            toggleTourItem:function($bool){

                if($bool){
                    this.$el.find('#tour_control_item').removeClass('hidden');
                }else{
                    this.$el.find('#tour_control_item').addClass('hidden');
                }
            }
		});
	}
);
