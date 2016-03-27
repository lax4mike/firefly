var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    concat         = require("gulp-concat"),
    filter         = require("gulp-filter"),
    rename         = require("gulp-rename"),
    debug          = require("gulp-debug"),
    gulpif         = require("gulp-if"),
    uglify         = require("gulp-uglify"),
    sourcemaps     = require("gulp-sourcemaps"),
    mainBowerFiles = require("main-bower-files");

var bowerRoot = config.root + "/polyfill";

// bower settings
utils.setTaskConfig("bower", {

    default: {
        root: bowerRoot,

        js: {
            filename: "polyfill.js",
            dest: config.dest + "/js"
        },

        // to skip, set value to false or omit entirely
        // otherwise, pass options object (can be empty {})
        uglify: false
    },

    prod: {
        uglify: {}
    }
});

// watch bower.json to regenerate bundle
utils.registerWatcher("bower", [
    bowerRoot + "/bower.json"
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
    var bowerfiles = mainBowerFiles({
        checkExistence: true,
        paths: bower.root,
        debugging: false
    });

    if (bowerfiles.length === 0){
        next(); return;
    }

    // log the bower files to the gulp output
    utils.logYellow("polyfill files", "\n\t" + bowerfiles.join("\n\t"));

    // make js
    return gulp.src(bowerfiles)
        .pipe(utils.drano())
        .pipe(filterByExtension("js"))
        .pipe(sourcemaps.init())  // start sourcemaps

        // putting a ; between each file to avoid problems when a library doesn't end in ;
        .pipe(concat(bower.js.filename, {newLine: ";"}))

        .pipe(gulpif((bower.uglify), uglify(bower.uglify)))
        .pipe(rename({
            suffix: "-generated"
        }))
        .pipe(sourcemaps.write("./")) // end sourcemaps
        .pipe(gulp.dest(bower.js.dest))
        .pipe(debug({title: "bower: "}));

});


function filterByExtension(extension){
    return filter(function(file){
        return file.path.match(new RegExp("." + extension + "$"));
    });
}
