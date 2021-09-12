const gulp = require("gulp");
const quench = require("./quench.js");
const changed = require("gulp-changed");
const debug = require("gulp-debug");
const R = require("ramda");

module.exports = function runCopyTask(userConfig) {
  const defaultConfig = {
    /**
     * src   : glob of files to copy
     * dest  : destination folder
     * base  : *optional, https://github.com/gulpjs/gulp/blob/master/docs/API.md#optionsbase
     * watch : *optional, files to watch that will trigger a rerun when changed
     *          defaults to src
     */
    debugTitle: "copy:",
  };

  const config = R.mergeDeepRight(defaultConfig, userConfig);

  if (!config.src || !config.dest) {
    quench.throwError(
      "Copy task requires src and dest!\n",
      `Was given ${JSON.stringify(config, null, 2)}`,
    );
  }

  const copy = () => {
    return gulp
      .src(config.src, { base: config.base })
      .pipe(quench.drano())
      .pipe(changed(config.dest))
      .pipe(gulp.dest(config.dest))
      .pipe(debug({ title: config.debugTitle }));
  };

  quench.maybeWatch(config.watch || config.src, copy, config.debugTitle);

  return copy();
};
