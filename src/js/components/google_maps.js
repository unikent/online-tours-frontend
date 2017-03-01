define(['jquery', 'app/config', 'app/models/poi', 'app/collections/pois', 'app/models/tour'], function($, AppConfig, POIModel, POICollection, TourModel){

	var googleMaps = $.Deferred();

    var mapsHelper = {


        kentIcons: function(){
            return {
                default: {
                    url: AppConfig.basePath + '/img/icons/default.png',
                    size: new google.maps.Size(22, 33),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 33)
                },
                focus: {
                    url: AppConfig.basePath + '/img/icons/focus.png',
                    size: new google.maps.Size(22, 33),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 33)
                },
                active: {
                    url: AppConfig.basePath + '/img/icons/active.png',
                    size: new google.maps.Size(22, 33),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 33)
                },
                fade: {
                    url: AppConfig.basePath + '/img/icons/fade.png',
                    size: new google.maps.Size(22, 33),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 33)
                },
                visited: {
                    url: AppConfig.basePath + '/img/icons/visited.png',
                    size: new google.maps.Size(22, 33),
                    origin: new google.maps.Point(0, 0),
                    anchor: new google.maps.Point(11, 33)
                }
            };
        },

        getLatLng : function(object){
            if(object instanceof POIModel){
                return new google.maps.LatLng(object.get('lat'), object.get('lng'));
            }else{
                return false;
            }
        },
        _calcViewportOffset: function(map){
            //get difference between viewport top/bottom in "latitude"
            var diff = Math.abs(map.getBounds().getNorthEast().lat() - map.getBounds().getSouthWest().lat());
            // Assume content draw takes up 40% of screen.
            // calc what 60 of viewport (remaining portion) is, in "lat", 
            //then half it to find offset we want
            return ((diff/100)*45) /2;
        },
        getOffsetLatLng: function(map, object){
            var point = this.getLatLng(object);
            if(!point) return false;
           
            var lat_offset = this._calcViewportOffset(map);
            return new google.maps.LatLng(object.get('lat')-lat_offset, object.get('lng'));
        },
        offset: function(map){
            var lat_offset = this._calcViewportOffset(map);
            var centre = map.getCenter();

            // pan view
            map.panTo(new google.maps.LatLng(centre.lat() - lat_offset, centre.lng()));
        },

        getBounds : function(object){

            var $bounds = new google.maps.LatLngBounds();
            var $data;
            var $this = this;

            if(object instanceof POIModel){
                $data = new google.maps.Data();
                $data.addGeoJson(object.get('polygon'));
                $data.forEach(function(feature) {
                    $this.processPoints(feature.getGeometry(), $bounds.extend, $bounds);
                });
                return $bounds;
            }

            if(object instanceof TourModel){
                var gpolyline = $this.generateGPolyline(object.get('polylineobj'));
                return gpolyline.bounds;
            }

            if(object instanceof POICollection){

                object.each(function(poi) {
                    $this.processPoints($this.getLatLng(poi), $bounds.extend, $bounds);
                });
                return $bounds;
            }

            return false;

        },

        expandBounds : function(bounds){

            var maxX = bounds.getNorthEast().lng();
            var maxY = bounds.getNorthEast().lat();
            var minX = bounds.getSouthWest().lng();
            var minY = bounds.getSouthWest().lat();

            var r = 0.03;
            maxY += r/3;
            minY -= r/3;
            maxX += r * Math.cos(maxY);
            minX -= r * Math.cos(minY);

            var newbounds = new google.maps.LatLngBounds();

            newbounds.extend(new google.maps.LatLng(maxY,maxX));

            newbounds.extend(new google.maps.LatLng(minY,minX));
            return newbounds;

        },

        checkBounds: function (allowedBounds, map) {

            if(! allowedBounds.contains(map.getCenter())) {
                var C = map.getCenter();
                var X = C.lng();
                var Y = C.lat();

                var AmaxX = allowedBounds.getNorthEast().lng();
                var AmaxY = allowedBounds.getNorthEast().lat();
                var AminX = allowedBounds.getSouthWest().lng();
                var AminY = allowedBounds.getSouthWest().lat();

                if (X < AminX) {X = AminX;}
                if (X > AmaxX) {X = AmaxX;}
                if (Y < AminY) {Y = AminY;}
                if (Y > AmaxY) {Y = AmaxY;}

                map.setCenter(new google.maps.LatLng(Y,X));
            }
        },

        //UNTESTED
        generateGPolyline: function (polyline) {
            var coords = [];
            var bounds = new google.maps.LatLngBounds();

            for (var i = 0; i < polyline.length; i++) {
                var latlng = new google.maps.LatLng(polyline[i].lat, polyline[i].lng);
                coords.push(latlng);
                bounds.extend(latlng);
            }

            return new google.maps.Polyline({
                path: coords,
                strokeOpacity: 0,
                strokeColor: '#08355D',
                icons: [{
                    icon: {
                        path: google.maps.SymbolPath.CIRCLE,
                        strokeOpacity: 1,
                        fillColor: '#08355D',
                        fillOpacity: 1,
                        scale: 1.5
                    },
                    offset: '0',
                    repeat: '10px'
                }],
                bounds: bounds
            });
        },

        processPoints: function(geometry, callback, thisArg) {
            if (geometry instanceof google.maps.LatLng) {
                callback.call(thisArg, geometry);
            } else if (geometry instanceof google.maps.Data.Point) {
                callback.call(thisArg, geometry.get());
            } else {
                geometry.getArray().forEach(function (g) {
                    processPoints(g, callback, thisArg);
                });
            }
        }

    };
	// callback needs to be globalish so goog to hit it
	window.google_maps_loaded = function() {

		googleMaps.resolve($.extend({} ,google.maps, mapsHelper ));
    };

     // Try and load google maps, to trigger "google_maps_loaded" in window scope and resolve the promise
	require(['https://maps.googleapis.com/maps/api/js?sensor=true&callback=google_maps_loaded'],
		function(){},
		function(err) {
			// Welp, thats not good...
     		googleMaps.reject();
    	}
    );


	return googleMaps.promise();
});