// *************************************
//
//   Gulpfile
//
// *************************************
//
// Available tasks:
//   `gulp`
//   `gulp build`
//   `gulp compile`
//   `gulp minify`
//   `gulp test`
//
// *************************************

// -------------------------------------
//   Plugins
// -------------------------------------
//
// gulp              : The streaming build system
// gulp-autoprefixer : Prefix CSS
// gulp-concat       : Concatenate files
// gulp-csscss       : CSS redundancy analyzer
// gulp-load-plugins : Automatically load Gulp plugins
// gulp-minify-css   : Minify CSS
// gulp-parker       : Stylesheet analysis tool
// gulp-plumber      : Prevent pipe breaking from errors
// gulp-rename       : Rename files
// gulp-sass         : Compile Sass
// gulp-sass-lint    : Lint Sass
// gulp-util         : Utility functions
// gulp-watch        : Watch stream
// run-sequence      : Run a series of dependent Gulp tasks in order
//
// -------------------------------------

var gulp = require('gulp');
var run = require('run-sequence');
var connect = require('gulp-connect');
var Reproxy = require("gulp-connect-reproxy");
var babel = require("gulp-babel");
var extender = require('gulp-html-extend');
var htmlbeautify = require('gulp-html-beautify');
var plugins = require('gulp-load-plugins')({

    rename: {
        'gulp-minify-css': 'cssmin'
    }

});

// -------------------------------------
//   Options
// -------------------------------------

var options = {

    // ----- Default ----- //

    default: {
        tasks: ['build', 'watch', 'connect']
    },

    // ----- Build ----- //

    build: {
        tasks: ['compile', 'minify'],
        destination: 'build/css'
    },

    // ----- CSS ----- //

    css: {
        files: 'build/css/*.css',
        file: 'build/css/application.css',
        destination: 'build/css'
    },

    // ----- Sass ----- //

    sass: {
        files: ['*.{sass,scss}', '**/*.{sass,scss}'],
        destination: 'build/css',
    },

    // ----- Html ----- //

    html: {
        files: ['./*.html'],
        destination: 'build',
    },

    // ----- js ----- //

    bebel: {
        files: 'build/es6/*.js',
        destination: 'build/js',
    },

    // ----- Watch ----- //

    watch_css: {
        files: 'build/css/*.css'
    },

    watch_html: {
        files: 'html/*.html'
    },

    watch: {
        files: function() {
            return [
                options.sass.files,
                options.watch_css.files,
                options.watch_html.files
            ]
        },
        run: function() {
            return [
                ['compile', 'minify'],
                ['html'],
                ['extend']
            ]
        }
    }

};

// -------------------------------------
//   Task: Default
// -------------------------------------

gulp.task('default', options.default.tasks);

// -------------------------------------
//   Task: Build
// -------------------------------------

gulp.task('build', function() {

    options.build.tasks.forEach(function(task) {
        gulp.start(task);
    });

});

// -------------------------------------
//   Task: Compile: Sass,js
// -------------------------------------

gulp.task('compile', function() {

    gulp.src(options.sass.files)
        .pipe(plugins.plumber())
        .pipe(plugins.sass({ indentedSyntax: true }))
        // .pipe(plugins.autoprefixer({
        //     browsers: ['last 2 versions'],
        //     cascade: false
        // }))
        .pipe(gulp.dest(options.sass.destination));

    gulp.src(options.bebel.files)
        .pipe(babel())
        .pipe(gulp.dest(options.bebel.destination));

});

// -------------------------------------
//   Task: Minify: CSS
// -------------------------------------

gulp.task('minify', function() {

    gulp.src(options.css.file)
        .pipe(plugins.plumber())
        .pipe(plugins.cssmin({ advanced: false }))
        .pipe(plugins.rename({ suffix: '.min' }))
        .pipe(gulp.dest(options.build.destination))

});

// -------------------------------------
//   Task: Test: CSS
// -------------------------------------

gulp.task('test', function() {

    gulp.src(options.css.file)
        .pipe(plugins.plumber())
        .pipe(plugins.parker())

    gulp.src(options.css.file)
        .pipe(plugins.plumber())
        .pipe(plugins.csscss())

});

// -------------------------------------
//   Task: Watch
// -------------------------------------

gulp.task('watch', function() {

    var watchFiles = options.watch.files();

    watchFiles.forEach(function(files, index) {
        gulp.watch(files, options.watch.run()[index]);
    });

});

gulp.task('connect', function() {
    connect.server({
        root: "build",
        port: 9000,
        livereload: true,

        middleware: function(connect, options) {

            options.rule = [/\.do/, /\.jsp/, /\.htm/, /\.html/];
            //or        options.rule = /\.do/; 

            options.server = "127.0.0.1:8081";

            var proxy = new Reproxy(options);

            return [proxy];
        }
    });
});

gulp.task('html', function() {
    gulp.src('./build/*.html')
        .pipe(connect.reload());
});

gulp.task('extend', function() {
    var options = {
        indentSize: 2
    };
    gulp.src('./html/*.html')
        .pipe(extender({ annotations: true, verbose: false })) // default options
        .pipe(htmlbeautify(options))
        .pipe(gulp.dest('./build'))
})
