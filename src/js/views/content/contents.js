define(
    [
        'backbone',
        'app/models/poi',
        'app/models/tour',
        'app/models/page',
        'app/views/content/text',
        'app/views/content/image',
        'app/views/content/audio',
        'app/views/content/video',
        'app/views/content/gallery',
        'app/views/content/pano',
        'app/views/content/playlist',
        'app/views/content/nocontent'
    ],
    function(Backbone,
             POIModel,
             TourModel,
             PageModel,
             textView,
             imageView,
             audioView,
             videoView,
             galleryView,
             panoView,
             playlistView,
             noContentView){
        return Backbone.View.extend({

            typeViews:{},
            subViews: [],
            obj: null,

            initialize: function(data){
                this.obj = data.obj;

                this.typeViews.textView = textView;
                this.typeViews.imageView = imageView;
                this.typeViews.audioView = audioView;
                this.typeViews.videoView = videoView;
                this.typeViews.playlistView = playlistView;
                this.typeViews.galleryView = galleryView;
                this.typeViews.panoView = panoView;

                this.render(this.obj);
            },

            render: function(obj){
                var $this = this;
                var html = '';

                if(this.obj !== obj){
                   this.cleanup();
                }
                this.obj = obj;

                if (obj.contents && obj.contents.length > 0) {
                    obj.contents.each(function (item) {
                        var $el = $('<div id="content-' + item.get('id') + '" class="content-item content-' + item.get('type') +'"></div>');
                        $this.$el.append($el);
                        var viewName = item.get('type')+'View';
                        var view = new $this.typeViews[viewName]({el:$el, model:item, poi: obj});
                        $this.subViews.push(view);
                        view.render();
                        view.trigger('domReady');
                    });
                }
                else {
                    var nocontent_view = new noContentView({model:obj});
                    nocontent_view.render();
                    $this.$el.append(nocontent_view.$el);
                    $this.subViews.push(nocontent_view);
                }

            },

            cleanup: function(){
                _.each(this.subViews,function(view){
                    view.remove();
                });
                this.subViews = [];
            }

        });
    }
);