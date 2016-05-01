/**
 *  Usage:
 *      Once per computer:
 *         $ npm install -g gulp
 *
 *      Once per project, in gulp folder:
 *         $ npm install
 *
 *
 *      Running clumped tasks (defined in this file) --
 *      see tasks/utils.js config
 *         $ gulp dev
 *
 *      Running single task (task defined in /tasks.  eg. /tasks/css.js)
 *         $ gulp css            // will use the default config
 *         $ gulp css --env prod // will use the prod config
 *
 *      For details on setConfig, see "user supplied keys" in /tasks/utils.js
**/

// Include gulp and plugins
var gulp    = require("gulp"),
    utils   = require("./tasks/utils"),
    path    = require("path"),
    config  = utils.loadConfig(); // initialize the config


// set some defaults
utils.setConfig({
    root  : path.resolve(__dirname, "../app"),
    dest  : path.resolve(__dirname, "../build"),
    env   : ""
});


// load the tasks
utils.loadTasks(["copy", "js", "js-common", "bower", "css"]);

/**
 * dev task
 */
gulp.task("dev", function(){

    // set the dev config (cache in utils.js)
    utils.setConfig({
        env   : "dev",
        watch : true
    });

    // build with this config
    utils.build();

});

/**
 * prod task
 */
gulp.task("prod", function(){

    // set the prod config (cache in utils.js)
    utils.setConfig({
        env   : "prod",
        watch : false
    });

    // build with this config
    utils.build();

});

/**
 * prod watch task
 * react is a lot faster with production build
 */
gulp.task("prod-watch", function(){

    // set the prod config (cache in utils.js)
    utils.setConfig({
        env   : "prod",
        watch : true
    });

    // build with this config
    utils.build();

});




// Default Task (run when you run 'gulp'). dev envirnoment
gulp.task("default", [config.local.defaultTask || "dev"]);
