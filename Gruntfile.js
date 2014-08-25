
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

			this.files.forEach(function(file) {
			  var contents = file.src.filter(function(filepath) {
			    // Remove nonexistent files (it's up to you to filter or warn here).
			    if (!grunt.file.exists(filepath)) {
			      grunt.log.warn('Source file "' + filepath + '" not found.');
			      return false;
			    } else {
			      return true;
			    }
			  }).map(function(filepath) {
			    // Read and return the file's source.
			    return grunt.file.read(filepath);
			  }).join('\n');
			  // Write joined contents to destination filepath.
			  grunt.file.write(file.dest, contents);
			  // Print a success message.
			  grunt.log.writeln('File "' + file.dest + '" created.');
			});

            var file = files.pop();

            grunt.log.writeln("Building " + file.src[0] + "...");
			dat_builder.build(this);

            var content = grunt.file.read(file.src[0], { encoding: null });

            zlib.gzip(content, function(err, compressed) {
                grunt.file.write(file.dest, compressed);
                grunt.log.ok("Compressed file written to " + file.dest);
                process();
            });
        }

        process();
    });

	grunt.registerTask('default',  ['jshint', 'browserify']);
};
