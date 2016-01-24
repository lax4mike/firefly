var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    gulpif         = require("gulp-if"),
    uglify         = require("gulp-uglify"),
    rename         = require("gulp-rename"),
    sourcemaps     = require("gulp-sourcemaps"),
    browserify     = require("browserify"),
    // shim           = require("browserify-shim"),
    through2       = require("through2"),
    babelify       = require("babelify");

var fs = require("fs");

// dev/default settings
utils.setTaskConfig("js", {

    default: {

        src: config.root + "/js/index.js",
        dest: config.dest + "/js",

        // js uglify options , to skip, set value to false or omit entirely
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

     // for browserify usage, see https://medium.com/@sogko/gulp-browserify-the-gulp-y-way-bb359b3f9623
    // ^^ we can't use vinyl-transform anymore because it breaks when trying to use b.transform()  // https://github.com/sogko/gulp-recipes/tree/master/browserify-vanilla
    var browserifyIt = through2.obj(function (file, enc, callback){

        // https://github.com/substack/node-browserify/issues/1044#issuecomment-72384131
        var b = browserify(js.browserify || {}) // pass options
            .add(file.path) // this file
            .transform("babelify", {presets: ["es2015", "react"]});

        // externalize all bower components if defined
        try {
            var bowerComponents = config.taskConfig.bower.default.root + "/import/bower_components";
            var packages = fs.readdirSync(bowerComponents);

            packages.forEach(function(p){
                b.external(p);
            });

            // hack for react-dom because it lives within the "react" package in bower
            b.external("react-dom");

            utils.logYellow("externalizing", packages.concat("react-dom"));

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

    return gulp.src(js.src)
        .pipe(utils.drano())
        .pipe(browserifyIt)
        .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
        .pipe(gulpif((js.uglify), uglify(js.uglify)))
        .pipe(rename({
            suffix: "-generated"
        }))
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(js.dest));

});
