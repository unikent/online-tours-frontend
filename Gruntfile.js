module.exports = function(grunt) {
	grunt.initConfig({

		requirejs: {
			dist: {
				options: {
					mainConfigFile: 'src/js/paths.js',
					include: [ '../../src/bower_components/requirejs/require' ],
					out: 'js/app.min.js',
				}
			}
		},
		copy: {
			live: {
				src: 'src/html/index.html',
				dest: 'index.html',
				options: {
					process: function (content, srcpath) {
						return content.replace("@app_bootstrap@", "<script src='--replace-basepath--/js/app.min.js'></script>")
									  .replace('@local.config@','<script type="text/javascript">window.appConfig = {"basePath": "--replace-basepath--","endpoint": "--replace-endpoint--"};</script>')
									  .replace(/@basePath@/g, '--replace-basepath--');
					}
				}
			},
			dev: {
				src: 'src/html/index.html',
				dest: 'index-dev.html',
				options: {
					process: function ($content, srcpath) {
						var content = $content.replace("@app_bootstrap@","<script data-main='@basePath@/src/js/paths.js' src='@basePath@/src/bower_components/requirejs/require.js'></script>");

						// Read in a "local.config.json" if it exists
						if(grunt.file.exists('local.config.json')){
							var config_data = grunt.file.read('local.config.json');
							var config = JSON.parse(config_data);

							content = content.replace('@local.config@','<script>window.appConfig = '+config_data+';</script>')
											 .replace(/@basePath@/g, config.basePath);
						}else{
							content = content.replace('@local.config@','').replace(/@basePath@/g, '');
						}

						return content;
					}
				}
			},
			fonts: {
				expand:true,
				cwd: 'src/bower_components/kent-font/public/fonts/',
				src: '**',
				dest: 'fonts/',
			}
		},
		less: {
			dev : {
				files: {
					//'./css/index.css': './src/less/index.less' ,
					'./css/main.css' : './src/less/master.less'
				},
			}
		},
		watch: {
			js: {
				files: [ './src/js/*.js', './src/js/**/*.js' ],
				tasks: [ 'jshint', 'requirejs:dist' ]
			},
			copy:{
				files: [ 'src/html/index.html' ],
				tasks: [ 'copy' ]
			},
			less: {
				files: [ 'src/less/*.less','src/less/**/*.less'  ],
				tasks: [ 'less' ]
			}
		},
		jshint: {
			all: [
				'Gruntfile.js',
				'./src/js/**/*.js',
				'!./src/js/components/geolocationmarker.js',
				'!./src/js/components/analytics.js'
			]
		}
	});


	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-jshint');

	// Define tasks
	grunt.registerTask('development', [ 'jshint', 'copy:fonts', 'copy:dev', 'less' ]);
	grunt.registerTask('production', [ 'jshint', 'copy:fonts', 'copy:live', 'requirejs:dist', 'less' ]);
	grunt.registerTask('default', [ 'development', 'watch' ]);
};
