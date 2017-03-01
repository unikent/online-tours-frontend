define([ 'app/config', 'app/collections/base', 'app/models/zone' ], function(AppConfig, BaseCollection, ZoneModel){
	return BaseCollection.extend({
		model: ZoneModel,

		url: function(){
			return AppConfig.endpoint + '/zones';
		},
	});
});