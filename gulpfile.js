/*

[ ] build without polymer bundled

*/

var gulp         = require( 'gulp' ),
    // stylus
    stylus       = require('gulp-stylus'),
    nib          = require('nib'),
    // watch
    watch        = require('gulp-watch'),
    // vulcanize
    vulcan       = require('gulp-vulcanize');


function compileCSS( files ) {
  return files
    .pipe( stylus({use: [nib()]}) )
    .pipe( gulp.dest('.') );
}

gulp.task( 'styles', function() {
  return compileCSS( gulp.src('*.styl') );
});

gulp.task( 'vulcanize', function() {

  var vulcanizer = vulcan({
    dest: 'build',
    inline: true,
    strip: true
  });

  return gulp.src('dat-gui.html')
    .pipe(vulcanizer);
});

gulp.task( 'watch', function() {
  watch( {glob: paths.style}, compileCSS );
});


gulp.task( 'default', ['styles'] );
