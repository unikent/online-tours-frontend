define([ 'app/collections/base', 'app/models/poi'], function(BaseCollection, POIModel){
	return BaseCollection.extend({
		model: POIModel,

		initialize: function(){
			// Horrible hack to ensure that POIModel is resolved by require when initializing in-depth.
			if(!POIModel){
				var m = require('app/models/poi');
				this.model = m;
			}
		}
	});
});