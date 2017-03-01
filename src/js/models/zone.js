define([ 'app/config', 'app/models/base', 'app/collections/tours', 'app/collections/pois' ], function(AppConfig, BaseModel, ToursCollection, POICollection){
	return Backbone.ModelFactory(BaseModel, {
		defaults: {
			name: null,
		},

        initialize: function(){
            this.tours = (this.tours || new ToursCollection());
            this.pois = (this.pois || new POICollection());

            this.listenTo(this.pois, 'reset', this.populateTours);
		},

		parse: function(resp, options){

            this.tours = (this.tours || new ToursCollection());
			this.tours.zone = this;
			if(resp.tours && (resp.tours.length > 0)){
				this.tours.reset(resp.tours);
			}

            this.pois = (this.pois || new POICollection());
            if(resp.pois && resp.pois && (resp.pois.length > 0)){
				this.pois.reset(resp.pois, {parse:true});
			}

			return resp;
		},

		getChildPOIs: function(){
			if(!this.pois || this.pois.length === 0){
				return [];
			}
			return this.pois.first().pois;
		},

        url: function(){
            return AppConfig.endpoint + '/zone/' + this.get('id');
        },

        populateTours: function(){
            this.tours.each(function(tour){
                tour.loadPOIs();
            });
        }


	});
});