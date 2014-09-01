
module.exports = function(grunt) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    var dirString = path.dirname(fs.realpathSync(__filename));

    // output example: "/Users/jb/workspace/abtest"
    console.log('directory to start walking...', dirString);


    var dat_builder = require('./utils/builder.js');

    grunt.initConfig({

        pkg: grunt.file.readJSON('package.json'),

        concat: {
        	// Patch the requireJS library file to include our configuration so we have a guaranteed initialized requireJS lib immediately on page load.
            patch_requireJS: {
                options: {
                    separator: '\n\n',
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %> */\n\n',
                },
                src: [
                	'examples/assets/requirejs/require.js', 
                	'examples/requireJS-config.js.include'
                ],
                dest: 'examples/assets/require-plus-config.js',
            },
        },

        jshint: {
            options: {
                jshintrc: true,
                force: true,
            },
            //options: '<json:.jshintrc>',
            grunt: {
              files: {
                src: 'Gruntfile.js'
              }
            },
            sources: {
              files: {
                src: ['src/**/*.js']
              }
            },
            //tests: {
            //  files: {
            //    src: ['tests/test.js']
            //  }
            //},
            //examples: {
            //  files: {
            //    src: ['examples/**/*.js', '!examples/assets/**/*.js']
            //  }
            //},
        },

		// requirejs: {
		//     compile: {
		//       	options: {
		//       		name: 'build-main',
		// 	        mainConfigFile: 'utils/build.js',
		// 	        out: './optimized.js'
		//       	}
		//     },
		// },

        builder: {
            gui: {
                options: {
                    main: 'dat/gui/GUI',
                    shortcut: 'dat.GUI',
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
                    main: 'dat/color/Color',
                    shortcut: 'dat.Color',
                },
                files: {
                    'build/dat.color.js': [ 'src/**/*.js' ]
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    require('load-grunt-tasks')(grunt, {scope: 'devDependencies'});

    grunt.registerMultiTask('builder', 'building the dat.gui library', function() {
        var done = this.async();

        var files = this.files.slice();

	    var options = this.options({
            verbose: false,
            baseUrl: './src/',
            main: 'main',
            out: './build/bundled.js',
            minify: false,
            shortcut: 'bundled',
            licenseFile: './utils/license.txt',
            paths: {}
	    });

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

              dat_builder.build(options, file.dest, srcfileset);
            });

            done();
        }

        process();
    });

    grunt.registerTask('patch_requireJS', ['concat:patch_requireJS']);

    grunt.registerTask('default',  ['jshint', 'patch_requireJS', 'builder']);
};
