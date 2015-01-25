'use strict';

var gulp = require('gulp');
var gulp_if = require('gulp-if');
var del = require('del');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var browserify = require('browserify');

var browserSync = require('browser-sync');
var reload = browserSync.reload;

var NODE_ENV = process.env.NODE_ENV || 'development';
var BROWSERSYNC_PORT = parseInt(process.env.BROWSERSYNC_PORT) || 3000;
var RELEASE = (NODE_ENV === 'production');
var DEST = './build';

gulp.task('clean', del.bind(null, [DEST]));

gulp.task('config', function() {
  gulp.src('./web/config.js')
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('generator', function() {
  var bundler = browserify({
    entries: ['./web/generator.js'],
    debug: true
  });

  return bundler
    .bundle()
    .pipe(source('generator.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(gulp_if(RELEASE, uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('html', function() {
  gulp.src('./web/*.html')
    .pipe(gulp.dest(DEST))
    .pipe(reload({stream: true}));
});

gulp.task('serve', ['default'], function() {
  browserSync({
    open: false,
    port: BROWSERSYNC_PORT,
    notify: false,
    server: 'build'
  });

  gulp.watch('./web/config.js', ['config']);
  gulp.watch('./web/generator.js', ['generator']);
  gulp.watch('./web/**/*.html', ['html']);
});

gulp.task('default', ['config', 'generator', 'html']);
