const SASS_PATH = 'assets/styles';
const SCRIPT_PATH = 'assets/scripts';

// *************************** IMPORTS ***********************************

// Basic tools
import gulp from 'gulp';
var gutil = require('gulp-util');
var notify = require('gulp-notify');
var rename = require('gulp-rename');
var concat = require('gulp-concat');
var del = require('del');
var minify = require('gulp-minify');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');

// for CSS
var sass = require('gulp-sass');
var cssnano = require('gulp-cssnano');
var stripCssComments = require('gulp-strip-css-comments');

// for JS
var babelify = require('babelify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');

// *************************** IMPORTS ***********************************



// **************************** CSS ******************************************

gulp.task('compile-sass', function() {
  return gulp.src(`${SASS_PATH}/master.sass`)
    .pipe(sass({indentedSyntax: true}))
    .pipe(rename({suffix: '.sass'}))
    .pipe(gulp.dest('public'));
});

gulp.task('concat-css',['compile-sass'], function() {
  return gulp.src([
    'public/master.sass.css',
    //'node_modules/sweetalert/src/sweetalert.css',
  ])
  .pipe(concat('master.css'))
  .pipe(gulp.dest('public'));
});

gulp.task('minify-css',['compile-sass', 'concat-css'], function() {
  return gulp.src('public/master.css')
  .pipe(rename({suffix: '.min'}))
  .pipe(stripCssComments())
  .pipe(cssnano())
  .pipe(gulp.dest('public'));
});

// **************************** CSS *******************************************




// **************************** JS  *******************************************

gulp.task('javascript', function () {
  return browserify({
    entries: 'assets/scripts/master.js',
    debug: true,
    transform: [babelify]
  })
  .bundle()
  .pipe(source('master.min.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(uglify())
  // .on('error', function(e) {
  //   notify(e);
  //   // console.log(e);
  //   // this.emit('end');
  //   //gutil.log(e);
  // })
  .pipe(gulp.dest('./public/'));
});

// **************************** JS  *******************************************

// **************************** GULP TASKS  ***********************************

gulp.task('cleanup',['minify-css'], function() {
  del('public/master.js');
  del('public/master.css');
  del('public/master.sass.css');
});

gulp.task('styles', ['compile-sass', 'concat-css', 'minify-css']);
gulp.task('scripts', ['javascript']);
gulp.task('default', ['styles', 'scripts', 'cleanup', 'watch']);

gulp.task('watch', function() {
  gulp.watch(`${SASS_PATH}/*.sass`, ['styles', 'cleanup']);
  gulp.watch(['bower_components/*', `${SCRIPT_PATH}/*.js`], ['scripts', 'cleanup']);
  gulp.watch(['public/master.html', 'public/master.min.js', 'public/master.min.css']);
});
