define([ 'app/config', 'app/collections/base', 'app/models/tour', 'app/models/poi' ], function(AppConfig, BaseCollection, TourModel, POIModel){
	return BaseCollection.extend({
		model: TourModel,

		url: function(){
			var url = AppConfig.endpoint + '/zone/'+this.zone.id+'/tours';
			return url;
		},

		parse: function(resp, options){
			// update the zone's root poi.
			var root_poi = new POIModel(resp.root);

			// update the tours
			return resp.tours;
		}
	});
});