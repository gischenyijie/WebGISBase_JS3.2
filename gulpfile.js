var gulp = require('gulp');
var sass = require('gulp-sass');
var browserSync = require('browser-sync').create();
var useref = require('gulp-useref');
var del = require("del");
var jshint = require('gulp-jshint');

gulp.task("default", ['run']);

// *** Run tasks

gulp.task("run", ['browserSync', 'compile-sass', 'jshint'], function() {
  gulp.watch('app/styles/**/*.scss', ['compile-sass']);
  gulp.watch('app/scripts/**/*.js', ['jshint']);
  gulp.watch('app/index.html', browserSync.reload);
});

gulp.task('jshint', function () {
  return gulp.src('app/scripts/**/*.js')
  .pipe(jshint())
  .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('compile-sass', function() {
  return gulp.src('app/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('app/styles/css'))
    .pipe(browserSync.reload({ stream: true }));
});

// *** Build tasks

gulp.task("build", ['clean', 'build-js', 'build-index', 'build-resources']);

gulp.task("serve-build", ['build'], function() {
  browserSync.init({
    server: {
      baseDir: 'dist'
    },
    browser: "chrome"
  })
});

gulp.task("build-js", function () {
  return gulp.src("app/scripts/js/**/*.js")
  .pipe(gulp.dest("dist/scripts/js"));
});

gulp.task("build-index", function() {
  return gulp.src('app/index.html')
    .pipe(useref())
    .pipe(gulp.dest('dist'));
});

gulp.task("build-resources", function() {
  return gulp.src("app/images/**/*.+(png|jpg|svg|gif)")
    .pipe(gulp.dest("dist/images"));
});

// *** Browser Sync
gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
    browser: "chrome"
  })
});

gulp.task('stop', function() {
  browserSync.exit();
});

gulp.task('clean', function() {
  return del.sync('dist');
});