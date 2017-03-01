define(
    [
        'backbone',
        'app/views/content/content_type',
        'text!app/templates/content_text.html'
    ],
    function(Backbone,BaseView, TextTemplate){
        return BaseView.extend({


            events: {
                'click a': 'routeLink'
            },

            initialize: function(data){
                this.model = data.model;
                this.template = _.template(TextTemplate);
            },

            routeLink : function(e){
                var link = $(e.target).attr('href');

                if(typeof link !=='undefined'){
                    if(link.match(/^\/map\//)){
                        e.preventDefault();
                        window.app.navigate(link,  true );
                        return false;
                    }else if(link.match(/^\/poi\/\d+/)){
                        link = '/map/' + window.app.currentZone.get('slug') + ((window.app.currentTour !== null)? "/"+window.app.currentTour.get('id'):'') + link;
                        e.preventDefault();
                        window.app.navigate(link,  true );
                        return false;
                    }
                }
            }

        });
    }
);