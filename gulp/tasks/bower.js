var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    browserify     = require("browserify"),
    concat         = require("gulp-concat"),
    rename         = require("gulp-rename"),
    gulpif         = require("gulp-if"),
    uglify         = require("gulp-uglify"),
    sourcemaps     = require("gulp-sourcemaps"),
    source         = require("vinyl-source-stream"),
    buffer         = require("vinyl-buffer"),
    mainBowerFiles = require("main-bower-files"),
    stringifyAligned = require("json-align"),
    mergeStream    = require("merge-stream") ;

var path = require("path");


// inside bowerRoot should be two directories:
//  - global - Files in here will be concated to vendor-generated.js as is so they will be available
//             as global variables in the browser.  This should be used to include polyfills and
//             jquery plugins, etc
//  - import - Files in here will be bundled and exposed by browserify.  This allows them to be imported
//             via es6 module import syntax.  EG. import React from "react";
var bowerRoot = config.root + "/vendor";

// bower settings
utils.setTaskConfig("bower", {

    default: {
        root: bowerRoot,

        filename: "vendor.js",
        dest: config.dest + "/js",

        // to skip, set value to false or omit entirely
        // otherwise, pass options object (can be empty {})
        uglify: false,

        browserify: {
            debug: true // include sourcemaps
        }
    },

    prod: {
        uglify: {},
        browserify: {
            debug: false // don't sourcemaps
        }
    }
});

// watch bower.json to regenerate bundle
utils.registerWatcher("bower", [
    bowerRoot + "/**/bower.json" // watch both "global" and "import" directories
]);


/* bundle up bower libraries */
// http://engineroom.teamwork.com/hassle-free-third-party-dependencies/
gulp.task("bower", function(next){

    var bower = utils.loadTaskConfig("bower");

    if (!bower || !bower.root){
        utils.logYellow("bower", "not configured");
        next(); return;
    }

    // https://github.com/ck86/main-bower-files
    // mainBowerFiles returns array of "main" files from bower.json
    // these files are in /vendor/import and should be bundled via browserify
    var importfiles = mainBowerFiles({
        checkExistence: true,
        paths: bower.root + "/import",
        debugging: false
    }).filter(byExtention("js"));

    // // log the bower files to the gulp output
    // utils.logYellow("bower files", "\n\t" + bowerfiles.join("\n\t"));

    var browserifiedStream = getBrowserifiedStream(importfiles, bower);

   var globalFiles = mainBowerFiles({
       checkExistence: true,
       paths: bower.root + "/global",
       debugging: false
   }).filter(byExtention("js"));

   utils.logYellow("global", JSON.stringify(globalFiles, null, 2));

   var globalStream = gulp.src(globalFiles);

   // make js
   mergeStream(browserifiedStream, globalStream)
       .pipe(utils.drano())
       .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file

       // putting a ; between each file to avoid problems when a library doesn't end in ;
       .pipe(concat(bower.filename, { newLine: ";" }))

       .pipe(gulpif((bower.uglify), uglify(bower.uglify)))
       .pipe(rename({
           suffix: "-generated"
       }))
       .pipe(sourcemaps.write("./")) // end sourcemaps
       .pipe(gulp.dest(bower.dest));

    next();

});

// create browserify bundle with the bower packages exposed
function getBrowserifiedStream(importFiles, bower){

    var b = browserify(bower.browserify || {}); // pass options

    var bowerInfo = importFiles
        .map(function(filepath){
            var exposeName = getBowerPackageName(filepath);

            // HACK * for react-dom
            if (exposeName === "react"){
                exposeName = path.basename(filepath, ".js");
            }

            return {
                filepath: filepath,
                exposeName: exposeName
            };
        });

    var bowerLog = bowerInfo.reduce(function(obj, info){
        obj[info.exposeName] = info.filepath;
        return obj;
    }, {});

    utils.logYellow("exposing", stringifyAligned(bowerLog));

    bowerInfo.forEach(function(info){
        // use .require instead of .add so it'a available from other bundles
        b.require(info.filepath, { expose: info.exposeName });
    });

    return b.bundle()
        .pipe(source(bower.filename)) // bs to make it work with gulp
        .pipe(buffer()); // https://github.com/gulpjs/gulp/issues/369 more bs to make it work with gulp;
}

function byExtention(extension){
    return function(filepath){
        return filepath.match(new RegExp("."+extension+"$"));
    };
}

// given /app/vendor/bower_components/classnames/index.js returns "classnames"
function getBowerPackageName(filepath) {
    return filepath.replace(/.*?[\/|\\]bower_components[\/|\\](.*?)[\/|\\].*/, "$1");
}
