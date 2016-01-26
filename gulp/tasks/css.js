var gulp          = require("gulp"),
    utils         = require("./utils"),
    config        = utils.loadConfig(),
    sass          = require("gulp-sass"),
    autoprefixer  = require("gulp-autoprefixer"),
    pixrem        = require("gulp-pixrem"),
    rename        = require("gulp-rename"),
    concat        = require("gulp-concat"),
    sourcemaps    = require("gulp-sourcemaps");

// css settings
utils.setTaskConfig("css", {
    default: {

        src: config.root + "/scss/**/*.scss",
        dest: config.dest + "/css/",

        filename: "index.css",

        sass: {
            outputStyle: "nested"
            // includePaths: require("node-neat").includePaths
        },

        autoprefixer: {
            browsers: ["> 1%", "last 2 versions", "Firefox ESR", "Opera 12.1", "ie >= 9"]
        }
    },

    prod: {
        sass: {
            outputStyle: "compressed"
        }
    }
});


// register the watch
utils.registerWatcher("css", [
    config.root + "/scss/**/*.scss"
]);


/* css task */
gulp.task("css", function() {

    var css = utils.loadTaskConfig("css");

    var gulpCss = gulp.src(css.src)
        .pipe(utils.drano())
        .pipe(sourcemaps.init())
        .pipe(sass(css.sass))
        .pipe(autoprefixer(css.autoprefixer))
        .pipe(pixrem("16px",{atrules: true, html: true}))
        .pipe(concat(css.filename, {newLine: ""}))
        .pipe(rename({
            suffix: "-generated"
        }));

    return gulpCss
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(css.dest));
});
