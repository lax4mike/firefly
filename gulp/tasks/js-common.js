var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    gulpif         = require("gulp-if"),
    uglify         = require("gulp-uglify"),
    rename         = require("gulp-rename"),
    debug          = require("gulp-debug"),
    sourcemaps     = require("gulp-sourcemaps"),
    browserify     = require("browserify"),
    vinylSource    = require("vinyl-source-stream"),
    vinylBuffer    = require("vinyl-buffer");

var path = require("path");

var packageJson = path.resolve(__dirname, "../../package.json");

utils.setTaskConfig("js-common", {

    // dev/default settings
    default: {

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
utils.registerWatcher("js-common", [
    packageJson
]);

gulp.task("js-common", function(){

    var js = utils.loadTaskConfig("js-common");
    var commonPackages = utils.getInstalledNPMPackages(js.commonPackageJson);

    return getCommonStream(commonPackages, js.commonFilename, js.browserify)
        .pipe(utils.drano())
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        .pipe(gulpif((js.uglify), uglify(js.uglify)))
        .pipe(rename({
            suffix: "-generated"
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(js.dest))
        .pipe(debug({title: "js-common: "}));
});

// http://stackoverflow.com/questions/30294003/how-to-avoid-code-duplication-using-browserify/30294762#30294762
// create browserify bundle with the common packages exposed
function getCommonStream(externalPackages, filename, browserifyOptions){

        // will expose externalPackages, eg. "react"
        var b = browserify(Object.assign({}, browserifyOptions, {
            require: externalPackages
        }));

        // set the node environment variable.
        // https://facebook.github.io/react/downloads.html#npm
        process.env.NODE_ENV = (config.env === "prod") ? "production" : "development";

        utils.logYellow("common npm packages", externalPackages);

    return b.bundle()
        .pipe(vinylSource(filename)) // bs to make it work with gulp
        .pipe(vinylBuffer()); // https://github.com/gulpjs/gulp/issues/369 more bs to make it work with gulp;
}
