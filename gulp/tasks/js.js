var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    gulpif         = require("gulp-if"),
    uglify         = require("gulp-uglify"),
    rename         = require("gulp-rename"),
    cached         = require("gulp-cached"),
    debug          = require("gulp-debug"),
    sourcemaps     = require("gulp-sourcemaps"),
    browserify     = require("browserify"),
    through2       = require("through2"),
    babelify       = require("babelify");

var path = require("path");

var packageJson = path.resolve(__dirname, "../../package.json");

utils.setTaskConfig("js", {

    // dev/default settings
    default: {

        src: config.root + "/js/index.js",
        dest: config.dest + "/js",

        commonFilename: "common.js",
        commonPackageJson: packageJson,

        // js uglify options. to skip, set value to false or omit entirely
        // otherwise, pass options object (can be empty {})
        uglify: false,

        // browserify options
        browserify: {
            debug: true // enable sourcemaps
        }
    },

    prod: {

        browserify: {},

        // uglify javascript for production
        uglify: {}
    }
});


// register the watch
utils.registerWatcher("js", [
    config.root + "/js/**/*.js",
    config.root + "/js/**/*.jsx"
]);


/* compile application javascript */
gulp.task("js", function(){

    var js = utils.loadTaskConfig("js");
    var commonPackages = utils.getInstalledNPMPackages(js.commonPackageJson);

    return gulp.src(js.src)
        .pipe(utils.drano())
        .pipe(bundleEm(js.browserify, commonPackages))
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        .pipe(gulpif((js.uglify), uglify(js.uglify)))
        .pipe(rename({
            suffix: "-generated"
        }))
        .pipe(sourcemaps.write("./"))
        // prevent unchanged files from passing through, this prevents browserSync from reloading twice
        .pipe(cached("js"))
        .pipe(gulp.dest(js.dest))
        .pipe(debug({title: "js: "}));

});




function bundleEm(browserifyOptions, externalPackages){

    return through2.obj(function (file, enc, callback){

        // https://github.com/substack/node-browserify/issues/1044#issuecomment-72384131
        var b = browserify(browserifyOptions || {}) // pass options
            .add(file.path) // this file
            .transform(babelify, {
                presets: ["es2015", "react"]
            });

        // externalize common packages
        try {
            externalPackages.forEach(function(p){
                b.external(p);
            });

            // utils.logYellow("common npm packages", externalPackages);
        }
        catch(e) { console.log("ERRR", e); /* do nothing */ }

        b.bundle(function(err, res){
            if (err){
                callback(err, null); // emit error so drano can do it's thang
            }
            else {
                file.contents = res; // assumes file.contents is a Buffer
                callback(null, file); // pass file along
            }
        });

    });
}
