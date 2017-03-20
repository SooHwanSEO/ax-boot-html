'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var notify = require("gulp-notify");
var babel = require('gulp-babel');
var spawn = require('child_process').spawn;
var fs = require('fs');
var replace = require('gulp-replace');
var sourcemaps = require('gulp-sourcemaps');

var ASSETS_SRC = "assets";
var ASSETS = "assets";

var AX5UI_PLUGINS = {
    "ax5core": "ax5core",
    "ax5ui-dialog": "ax5dialog",
    "ax5ui-mask": "ax5mask",
    "ax5ui-toast": "ax5toast",
    "ax5ui-modal": "ax5modal",
    "ax5ui-calendar": "ax5calendar",
    "ax5ui-picker": "ax5picker",
    "ax5ui-formatter": "ax5formatter",
    "ax5ui-menu": "ax5menu",
    "ax5ui-select": "ax5select",
    "ax5ui-grid": "ax5grid",
    "ax5ui-combobox": "ax5combobox",
    "ax5ui-layout": "ax5layout",
    "ax5ui-binder": "ax5binder",
    "ax5ui-autocomplete": "ax5autocomplete"
};

function errorAlert(error) {
    notify.onError({title: "Gulp Error", message: "Check your terminal", sound: "Purr"})(error); //Error Notification
    console.log(error.toString());//Prints Error to Console
    this.emit("end"); //End function
}

/**
 * JS
 */
gulp.task('plugin-js', function () {
    var jss = [
        ASSETS_SRC + '/plugins/jquery/dist/jquery.js',
        ASSETS_SRC + '/plugins/ztree_v3/js/jquery.ztree.core.js',
        ASSETS_SRC + '/plugins/ztree_v3/js/jquery.ztree.excheck.js',
        ASSETS_SRC + '/plugins/ztree_v3/js/jquery.ztree.exedit.js'
    ];
    for (var k in AX5UI_PLUGINS) {
        jss.push(ASSETS_SRC + '/plugins/' + k + '/dist/' + AX5UI_PLUGINS[k] + '.js');
    }

    gulp.src(jss)
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(sourcemaps.init())
        .pipe(concat('plugins.js'))
        .pipe(gulp.dest(ASSETS + '/js'))
        .pipe(concat('plugins.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(ASSETS + '/js'));
});

gulp.task('errorpage-js', function () {
    var jss = [ASSETS_SRC + '/js/axboot/common/brokebot/*.js'];

    gulp.src(jss)
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(concat('brokebot.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(ASSETS_SRC + '/js/axboot/common'));
});

gulp.task('axboot-js', function () {
    var jss = [ASSETS_SRC + '/js/axboot/src/_axboot.js', ASSETS_SRC + '/js/axboot/src/modules/*.js'];

    gulp.src(jss)
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(sourcemaps.init())
        .pipe(concat('axboot.js'))
        .pipe(babel({
            presets: ['es2015'],
            compact: false
        }))
        .pipe(gulp.dest(ASSETS + '/js/axboot/dist'))
        .pipe(concat('axboot.min.js'))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(ASSETS + '/js/axboot/dist'));
});

/**
 * SASS
 */
gulp.task('scss', function () {

    gulp.src(ASSETS_SRC + '/scss/axboot.scss')
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(sass({outputStyle: 'compressed'}))
        //.pipe(sass({outputStyle: 'nested'}))
        .pipe(gulp.dest(ASSETS + '/css'));

});

gulp.task('scss-ie9', function () {

    gulp.src([
        ASSETS_SRC + '/scss/axboot-01.scss',
        ASSETS_SRC + '/scss/axboot-02.scss',
        ASSETS_SRC + '/scss/axboot-03.scss'
    ])
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(gulp.dest(ASSETS + '/css'));

});

gulp.task('dashboard-scss', function () {
    gulp.src(ASSETS_SRC + '/plugins/light-bootstrap-dashboard/scss/light-bootstrap-dashboard.scss')
        .pipe(plumber({errorHandler: errorAlert}))
        .pipe(sass({outputStyle: 'compressed'}))
        //.pipe(sass({outputStyle: 'nested'}))
        .pipe(gulp.dest(ASSETS + '/plugins/css/light-bootstrap-dashboard'));
});

/**
 * watch
 */
gulp.task('watching', function () {

    // PLUGIN-JS
    //gulp.watch(WEBAPP + '/plugins/**/*.js', ['plugin-js']);
    // JS
    gulp.watch(ASSETS_SRC + '/js/axboot/src/**/*.js', ['axboot-js']);
    // SASS
    gulp.watch(ASSETS_SRC + '/scss/**/*.scss', ['scss']);
    // for LANG
    gulp.watch(ASSETS_SRC + '/lang/*.*', ['language']);
});

gulp.task('default', function () {
    var process;

    //gulp.watch(WEBAPP + '/plugins/*.js', spawnChildren);

    spawnChildren();

    function spawnChildren(e) {
        // kill previous spawned process
        if (process) {
            process.kill();
        }

        // `spawn` a child `gulp` process linked to the parent `stdio`
        process = spawn('gulp', ['watching'], {stdio: 'inherit'});
    }
});