//https://github.com/udacity/fend-office-hours/tree/master/Front%20End%20Tools/Gulp

var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    minifyhtml = require('gulp-minify-html'),
    babel = require('gulp-babel'),
    sourcemaps = require('gulp-sourcemaps');


var paths = {
    scripts: [
        'src/js/resources.js',
        'src/js/app.js',
        'src/js/engine.js'
    ],
    styles: ['src/css/**/*.scss'],
    images: ['src/images/**/*'],
    content: ['src/index.html']
}

gulp.task('scripts', function() {
    gulp.src(paths.scripts)
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(concat('app.js'))
        .pipe(sourcemaps.write('.'))
        .pipe(rename('app.min.js'))
        .pipe(gulp.dest('./js/'));
});

gulp.task('styles', function() {
    gulp.src(paths.styles)
        .pipe(sass())
        .pipe(gulp.dest('./css'));
});

gulp.task('content', function(){
    return gulp.src(paths.content)
        .pipe(minifyhtml({
            empty: true,
            quotes: true
        }))
        .pipe(gulp.dest('./'));
});

gulp.task('images', function() {
    return gulp.src(paths.images)
        .pipe(gulp.dest('./images'));
});

gulp.task('watch', function() {
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.styles, ['styles']);
    gulp.watch(paths.content, ['content']);
    gulp.watch(paths.images, ['images']);
});




gulp.task('default', ['watch','scripts', 'styles', 'content', 'images']);