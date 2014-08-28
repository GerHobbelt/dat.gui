
module.exports = function(grunt) {

	var dat_builder = require('utils/builder.js');

	grunt.initConfig({
		// lint: {
		// 	all: ['src/**/*.js']
		// },
		jshint: {
			options: '<json:.jshintrc>'
		},
		browserify: {
			'build/dat.gui.js': {
				entries: ['src/**/*.js'],
				options: {
					debug: true
				}
			}
		},
		builder: {
			gui: {
				options: {
				    verbose: true,
				    baseUrl: "../src/",
				    main: "dat/gui/GUI",
				    out: "../build/dat.gui.js",
				    minify: false,
				    shortcut: "dat.GUI",
				    paths: {},
				    umd: {
				        ret: 'dat'
				    }
				},
				files: {
					'build/dat.gui.js': [ 'src/**/*.js' ]
				}
			},
			color: {
				options: {
				    verbose: true,
				    baseUrl: "../src/",
				    main: "dat/color/Color",
				    out: "../build/dat.color.js",
				    minify: false,
				    shortcut: "dat.Color",
				    paths: {}
				},
				files: {
					'build/dat.color.js': [ 'src/**/*.js' ]
				}
			}
		}
	});

	// These plugins provide necessary tasks.
	require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    grunt.registerMultiTask('builder', "building the dat.gui library", function() {
        var done = this.async();

        var files = this.files.slice();

        function process() {
            if (files.length <= 0) {
                done();
                return;
            }

			files.forEach(function(file) {
			  var srcfileset = file.src.filter(function(filepath) {
			    // Remove nonexistent files (it's up to you to filter or warn here).
			    if (!grunt.file.exists(filepath)) {
			      grunt.log.warn('Source file "' + filepath + '" not found.');
			      return false;
			    } else {
			      return true;
			    }
			  });

			  var options = this.options;
			  dat_builder.build(options, file.dest, srcfileset);
			});

			done();
        }

        process();
    });

	grunt.registerTask('default',  ['jshint', 'builder']);
};
