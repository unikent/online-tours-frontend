define(
    [
        'backbone',
        'app/config',
        'text!app/templates/list.html',
        'text!app/templates/menu-item.html',
        'app/models/zone',
        'app/models/tour'
    ],
    function(Backbone, config, ListTemplate, ListItemTemplate, ZoneModel, TourModel){
        return Backbone.View.extend({

            object: null,
            templates: {},
            events: {
                'click .back': 'show_map',
                'click ul li': 'show_poi',
                'keyup .poi_filter': 'filter_pois'
            },

            initialize: function(data){

                this.$el = $('<div class="app_page list_page"></div>');
                $(".app_wrapper").append(this.$el);
                this.el = this.$el[0];

                this.templates.list = _.template(ListTemplate);
                this.templates.item = _.template(ListItemTemplate);

            },

            render: function(object){

                var $this = this;

                this.object = object;

                var sub = (this.object instanceof ZoneModel)?false:object.zone.get('name');

                var html = this.templates.list({title: this.object.get('name'), 'subtitle':sub, 'base_url': config.basePath});

                this.$el.html(html);

                var pois = $(document.createElement("ul"));

                poiModels = (this.object instanceof ZoneModel)?this.object.getChildPOIs():this.object.pois;

                poiModels.each(function(item){

                    pois.append($this.templates.item({'name': item.get('name'), 'id': item.get('id')}));

                });

                var section = this.$el.find('section.pois').append(pois);

                this.ready = true;
                this.trigger("viewReady");
            },

            show_map: function(e){
                Backbone.trigger('backToMap');
            },

            show_poi: function(e){

                // Page gets re-rendered when viewed so this will be auto cleaned up
                $(e.currentTarget).find("i").removeClass('kf-chevron-right').addClass('kf-spinner kf-spin');

                var poi_id = $(e.currentTarget).attr('data-id');

                var zone = (this.object instanceof ZoneModel)?this.object.get('slug'):this.object.zone.get('slug') + '/' + this.object.get('id');

                window.app.navigate('/map/'+ zone + '/poi/' +poi_id,  true );

                $('.pois li',this.$el).removeClass('hidden');
            },

            filter_pois: function(e){

                var $search = $(e.currentTarget).val().toLowerCase();
                $('.pois li',this.$el).each(function(){
                    if($(this).text().toLowerCase().indexOf($search) > -1){
                        $(this).removeClass('hidden');
                    }else{
                        $(this).addClass('hidden');
                    }
                });
            }


        });
    }
);