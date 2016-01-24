var gulp           = require("gulp"),
    utils          = require("./utils"),
    config         = utils.loadConfig(),
    browserSync    = require("browser-sync").create();


// browserSync settings
var settings = {
    port: config.local.browserSyncPort || 8080,
    open: false, // or  "external"
    notify: false,
    ghostMode: false,

    // watch these files and reload the browser when they change
    files: [
        config.dest + "/**"
    ]

};


// set the server root, or proxy if it's set in local.js
// use proxy if you have a server running the site already (eg, IIS)
if (config.local.hostname) {
    // http://www.browsersync.io/docs/options/#option-proxy
    settings.proxy = config.local.hostname;
}
else {
    // http://www.browsersync.io/docs/options/#option-server
    settings.server = config.dest;
}


/* start browser sync if we have the "watch" option */
gulp.task("browserSync", function(){

    if (config.watch === true){
        utils.logYellow("watching", "browserSync:", settings.files);
        browserSync.init(settings);
    }

});
