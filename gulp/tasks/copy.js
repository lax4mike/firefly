var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig();


var src = [
    config.root + "/data/**/*.json",
    config.root + "/index.html"
];

// copy files settings
utils.setTaskConfig("copy", {

    default: {
        src: src,
        dest: config.dest
    },

    prod: {

    }

});

// register the watch
utils.registerWatcher("copy", src);


/* copy files */
gulp.task("copy", function(next) {

    var copy = utils.loadTaskConfig("copy");

    return gulp.src(copy.src, { base: config.root })
            .pipe(utils.drano())
            .pipe(gulp.dest(copy.dest));

});
