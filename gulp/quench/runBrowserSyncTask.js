const quench = require("./quench.js");
const R = require("ramda");
const chalk = require("chalk");
const browserSync = require("browser-sync");

module.exports = function runBrowserSyncTask(userConfig = {}) {
  const localJs = quench.loadLocalJs();

  if (!userConfig.server && !userConfig.proxy && !localJs.proxy) {
    quench.logYellow(
      "WARNING!",
      chalk.yellow("Browsersync was called but is not running!\n"),
      "If you're expecting to use browsersync, you probably need to create a",
      `${chalk.cyan("local.js")} and provide a ${chalk.cyan("proxy")}!\n`,
      "see /gulp/readme.md#runbrowsersynctaskjs"
    );

    return Promise.resolve();
  }

  const defaults = {
    port: localJs.browserSyncPort || userConfig.port || 3000,
    open: false, // false or  "external"
    notify: false,
    ghostMode: false,

    // watch these default files and reload the browser when they change
    // can be overwritten by userConfig
    files: userConfig.server
      ? [
          userConfig.server + "/**",
          // prevent browser sync from reloading twice when the regular file (eg. index.js)
          // and the map file (eg. index.js.map) are generated
          "!**/*.map"
        ]
      : undefined,

    // set the server root, or proxy if it's set in local.js
    // see /gulp/readme.md#runbrowsersynctaskjs
    //
    // don't run a proxy if a server is set.
    //   - A developer might have a proxy set in local.js for task A, but are trying
    //     to run task B, which uses a server, not a proxy.
    proxy: userConfig.server
      ? undefined
      : localJs.proxy || userConfig.proxy || undefined,

    // use this if you want to proxy a dev server and serve certain files from
    // your local machine. eg:
    //   "serveStatic": [{
    //     "route": "/styles",
    //     "dir": "/path/to/project/styles"
    //   }]
    // https://browsersync.io/docs/options#option-serveStatic
    serveStatic: []

    // https://browsersync.io/docs/options#option-serveStaticOptions
    // serveStaticOptions: {}

    // if not using proxy, use userConfig.server as the server root
    // http://www.browsersync.io/docs/options/#option-server
    // server: "path/to/build/"
  };

  // proxy/port is taken care of in the defaults
  const browserSyncSettings = R.mergeDeepRight(
    defaults,
    R.omit(["proxy", "port"], userConfig)
  );

  // only run browser-sync if we're also watching
  if (quench.isWatching()) {
    // don't fail if files isn't defined
    if (browserSyncSettings.files) {
      quench.logYellow(
        "watching",
        "browserSync:",
        JSON.stringify(browserSyncSettings.files, null, 2)
      );
    }

    // returning a promise for gulp 4
    // https://gulpjs.com/docs/en/getting-started/async-completion
    return new Promise((resolve, reject) => {
      browserSync.create().init(browserSyncSettings, (error, bs) => {
        if (error) {
          throw error;
        }
        resolve(bs);
      });
    }).catch(error => {
      quench.throwError(
        "There was an error starting browser sync.  Is there something wrong with your settings?\n ",
        chalk.white("browserSyncSettings: "),
        chalk.white(JSON.stringify(browserSyncSettings, null, 2)),
        "\n\n",
        error,
        "\n"
      );
    });
  }
  // if we're not watching, alert the user
  else {
    quench.logYellow(
      "WARNING!",
      chalk.yellow("Browsersync task was called, but watch is false.")
    );
    return Promise.resolve();
  }
};
