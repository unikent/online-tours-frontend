define([ 'app/models/base','app/collections/pois', 'app/models/poi', 'app/collections/content'], function(BaseModel, POICollection, POIModel, ContentCollection){
	return Backbone.ModelFactory(BaseModel, {
		defaults: {
			name: null,
            description:null,
            distance:null,
            duration:null,
            polyline:null,
            items:null,
            zone:null
		},

        initialize: function(){
            this.pois = (this.pois || new POICollection());
            this.contents = (this.contents || new ContentCollection());
        },

        /**
         * get the polyline as an object (its otherwise a geojson string)
         * use this.get('polylineobj') to invoke it
         */
        getPolylineobjAttribute: function(){
            if (this.get('polyline') !== null && this.get('polyline') !== '') {
                var polyline = JSON.parse(this.get('polyline'));
                if (polyline.length == 1) {
                    // grab the array of points, thats what we want
                    polyline = polyline[0];
                }

                // close the loop by ending with the first point
                if (polyline.length > 1) {
                    polyline.push(polyline[0]);
                }
                
                return polyline;
            }
            return [];
        },


        getDurationAttribute: function(){
            var $d =  this.attributes.duration;

                $h = Math.floor($d/60);
                $m = $d%60;

                $out = '';
                if($h>0){
                    $out += $h + '&nbsp;hour';
                    if($h>1){
                        $out +='s';
                    }
                    $out +='&nbsp;';
                }
                if($m>0) {
                    $out += $m + '&nbsp;mins';
                }

            return $out.trim();

        },


        /*
         Populate the pois collection by retrieving each `items` POI model from the model factory
         NOTE if the POI model does not exist this will create it with no attributes/data so this collection should never be relied on as a source of truth!
         This function is triggered when an owning zones poi collection is reset
        */
        loadPOIs : function(){
            var itemsAsIds = [];
            _.each(this.get('items'),function($id){
                itemsAsIds.push(new POIModel({id:$id}));
            });
            this.pois.reset(itemsAsIds);
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

            return resp;
        }

	});
});