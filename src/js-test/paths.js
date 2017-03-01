require.config({
  paths: {
    mocha: '../../src/bower_components/mocha/mocha',
    chai: '../../src/bower_components/chai/chai',
    sinon: '../../src/bower_components/sinon/index',

    jquery: '../../src/bower_components/jquery/dist/jquery',
    underscore: '../../src/bower_components/underscore/underscore',
    backbone: '../../src/bower_components/backbone/backbone',
    backbone_model_factory: '../../src/bower_components/backbone-model-factory/backbone-model-factory',
    backbone_fetch_cache: '../../src/bower_components/backbone-fetch-cache/backbone.fetch-cache',
    text: "../../src/bower_components/requirejs-text/text",

    hammerjs: "../../src/bower_components/hammerjs/hammer",
    'jquery-hammerjs': "../../src/bower_components/jquery-hammerjs/jquery.hammer",
    backbone_hammer: "../../src/bower_components/backbone.hammer/backbone.hammer",

    app_test: '.',
    app: '../js',

    app_overrideable_config: 'config',
  },

  shim: {
    'mocha': { exports: 'mocha' },
    'sinon': { exports: 'sinon' }
  },

	deps: [ 'backbone_fetch_cache', 'app_test/main' ]
});