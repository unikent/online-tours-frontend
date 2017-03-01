define([ 'require', 'app/config', 'app/models/base','app/collections/pois', 'app/collections/content' ], function(require, AppConfig, BaseModel, POICollection, ContentCollection){
	return Backbone.ModelFactory(BaseModel, {

        defaults: {
            slug:null,
            name: null,
            location: {
                name:null,
                lat:null,
                lng:null,
                polygon:null
            },
            focus:false,
            active:false,
            enabled:true,
            visited: false,
            icon:'default'
        },

        //UNTESTED - covered by Base Model get tests and defaults, revise if this function ever does more than simply return the value.
        getLatAttribute: function(){
            return this.get('location').lat;
        },

        //UNTESTED - covered by Base Model get tests and defaults, revise if this function ever does more than simply return the value.
        getLngAttribute: function(){
            return this.get('location').lng;
        },

        //UNTESTED - covered by Base Model get tests and defaults, revise if this function ever does more than simply return the value.
        getPolygonAttribute: function(){
            return this.get('location').polygon;
        },

        initialize: function(){
             /*
             * prevent circular dependency as first call will not have resolved POICollection yet
             * parse is called before initialize in the constructor
             */
            POICollection = require('app/collections/pois');

            this.pois = (this.pois || new POICollection());
            this.contents = (this.contents || new ContentCollection());

            this.bind("change:focus", this.resetIcon);
            this.bind("change:active", this.resetIcon);
            this.bind("change:enabled", this.resetIcon);
            this.bind("change:visited", this.resetIcon);
            this.bind("change:visited", this.updateVisitedCache);
        },

        parse: function(resp, options){

            /*
             * prevent circular dependency as first call will not have resolved POICollection yet
             * parse is called before initialize in the constructor
             */
            POICollection = require('app/collections/pois');

            this.pois = (this.pois || new POICollection());
            if(resp.children && (resp.children.length > 0)){
                this.pois.reset(resp.children,{parse:true});
            }

            this.contents = (this.contents || new ContentCollection());
            if(resp.contents && (resp.contents.length > 0)){
                this.contents.reset(resp.contents,{parse:true});
            }

            resp.visited = this.get('visited') || this.getVisitedCache(resp.id);
            return resp;
        },

        url: function(){
            return AppConfig.endpoint + '/poi/' + this.get('id');
        },

        resetIcon: function () {
            if(this.get('active')){
                if(this.get('icon') !=='active') {
                    this.set({icon: 'active'});
                }
            }else{

                if(this.get('focus')) {
                    if(this.get('icon') !=='focus') {
                        this.set({icon: 'focus'});
                    }
                }else{
                    
                    if(this.get('enabled')) {
                        if(this.get('visited')) {
                            if(this.get('icon') !=='visited') {
                                this.set({icon: 'visited'});
                            }
                        }
                        else{
                            if(this.get('icon') !=='default') {
                                this.set({icon: 'default'});
                            }
                        }
                    }else{
                        if(this.get('icon') !=='fade') {
                            this.set({icon: 'fade'});
                        }
                    }

                    
                }
            }
        },

        hasLocalStorage: function() {
            try {
                return 'localStorage' in window && window.localStorage !== null;
            } catch (e) {
                return false;
            }
        },

        getVisitedCache: function($id){
            if(typeof window.app !== 'undefined'){
                if (typeof window.app.poiCache == 'undefined') {
                    if (this.hasLocalStorage()) {
                        if (localStorage.poiCacheExpiry < (Date.now() - 86400000)) {
                            window.app.poiCache = {};
                        } else {
                            if (typeof localStorage.poiCache !== 'undefined') {
                                window.app.poiCache = JSON.parse(localStorage.poiCache);
                            } else {
                                window.app.poiCache = {};
                            }
                        }
                    } else {
                        window.app.poiCache = {};
                        return false;
                    }
                }
                if (typeof $id == 'undefined') {
                    $id = this.get('id');
                }
                return (typeof window.app.poiCache[$id] !== 'undefined') ? window.app.poiCache[$id] : false;
            }else{
                return false;
            }
        },
        updateVisitedCache: function(){
            if (typeof window.app !== 'undefined' && this.hasLocalStorage()) {
                var $id = this.get('id');
                window.app.poiCache[$id] = this.get('visited');
                localStorage.poiCache = JSON.stringify(window.app.poiCache);
                localStorage.poiCacheExpiry = Date.now();
            }
        }

	});
});