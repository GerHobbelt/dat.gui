
module.exports = function(grunt) {

    'use strict';

    var fs = require('fs'),
        path = require('path');

    var dirString = path.dirname(fs.realpathSync(__filename));

    // output example: "/Users/jb/workspace/abtest"
    console.log('directory to start walking...', dirString);


    var dat_builder = require('./utils/builder.js');
    var amdclean = require('amdclean');

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

		requirejs: {
            lib: {
                options: {
                    //rjs: '../requirejs-optimizer/r.js',
                    //mainConfigFile: 'build.js',
                    buildFile: 'build.js',
                }
            }
		},

        amdclean: {
            lib: {
                options: {
                    // Wrap any build bundle in a start and end text specified by wrap
                    // This should only be used when using the onModuleBundleComplete RequireJS
                    // Optimizer build hook
                    // If it is used with the onBuildWrite RequireJS Optimizer build hook, each
                    // module will get wrapped
                    wrap: {
                        // This string is prepended to the file
                        start: '\n' +
                               '\n' +
                               '/**\n' +
                               ' * dat-gui JavaScript Controller Library\n' +
                               ' * http://code.google.com/p/dat-gui\n' +
                               ' *\n' +
                               ' * Copyright 2011 Data Arts Team, Google Creative Lab\n' +
                               ' *\n' +
                               ' * Licensed under the Apache License, Version 2.0 (the "License");\n' +
                               ' * you may not use this file except in compliance with the License.\n' +
                               ' * You may obtain a copy of the License at\n' +
                               ' *\n' +
                               ' * http://www.apache.org/licenses/LICENSE-2.0\n' +
                               ' */\n' +
                               '\n' +
                               'var datGUI = (function () {\n\n\n'
                        ,
                        // This string is appended to the file
                        end: '\n\n\n' +
                             '    return datGUI;\n' +
                             '})();\n\n'
                    }
                },
                files: {
                    'build/dat.gui.js': [ 
                        'build/dat.gui.RAW.js' 
                    ]
                }
            },
        },

        builder: {
            gui: {
                options: {
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

    grunt.registerMultiTask('amdclean', 'cleaning the combined dat.gui library', function() {
        var done = this.async();

        var files = this.files.slice();

        var options = this.options({
            verbose: false,
            transformAMDChecks: false,
            prefixMode: 'standard',
            prefixTransform: function(moduleName) {
                // console.log('prefixtransform: ', moduleName);
                // var name = moduleName.replace(/[\\\/_]/g, '.'); 
                // console.log('prefixtransform: ', moduleName, name);
                // return name; 
                return moduleName;
            },
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
        
              var output = srcfileset.map(function(filepath) {
                return grunt.file.read(filepath);
              }).join('\n\n');
              options.code = output;
              options.filePath = file.dest;

              var cleanedCode = amdclean.clean(options);

              grunt.file.write(file.dest, cleanedCode);
            });

            done();
        }

        process();
    });

    grunt.registerTask('patch_requireJS', ['concat:patch_requireJS']);

    grunt.registerTask('default',  ['jshint', 'patch_requireJS', 'builder']);
};
