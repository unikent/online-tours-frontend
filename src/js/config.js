define([ 'underscore' ], function(_){
	var config = {
		// Setup default app configuration
		_defaults: {
			cors: false,
			basePath: '',
			endpoint: '//api.kent.ac.uk/api/v1/tours',
		},

		_configuration: {},

		loadConfig: function(){
			var that = this;

			// Unset any existing accessors...
			_.each(that._configuration, function(value, key){
		        if([ '_defaults', '_configuration' ,'loadConfig' ].indexOf(key) == -1){
		            that[key] = undefined;
		        }
			});

			// ...then wipe the existing configuration
			that._configuration = {};

			// Merge any overrides set in window.appConfig
			if(typeof(window.appConfig) !== 'undefined'){
				that._configuration = _.extend(_.clone(that._defaults), window.appConfig);
			} else {
				that._configuration = _.clone(that._defaults);
			}

			// Set accessors for each configuration property
			_.each(that._configuration, function(value, key){
		        if(typeof that[key] == 'undefined'){
		            that[key] = that._configuration[key];
		        }
			});
		},
	};

	config.loadConfig();
	return config;
});