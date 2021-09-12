const gulp = require("gulp");
const quench = require("./quench.js");
const debug = require("gulp-debug");
const R = require("ramda");
const svgstore = require("gulp-svgstore");
const rename = require("gulp-rename");

/**
 * Usage: put svg's in svg.src directory.  eg. /img/svg-sprite/my-icon.svg
 *        They will be compiled into svg.filename. eg. /img/svg-sprite.svg
 *
 * In html: <svg><use xlink:href="/img/svg-sprite.svg#my-icon"></use></svg>
 *
 * In css: svg { fill: BlanchedAlmond; }
 */

module.exports = function runSvgSpriteTask(userConfig) {
  const defaultConfig = {
    /**
     * src   : glob of files to copy
     * dest  : destination folder
     * base  : *optional https://github.com/gulpjs/gulp/blob/master/docs/API.md#optionsbase
     * watch : *optional, files to watch that will trigger a rerun when changed
     *          defaults to src
     */
    filename: "svg-sprite.svg",

    debugTitle: "svg-sprite:",
  };

  const config = R.mergeDeepRight(defaultConfig, userConfig);

  if (!config.src || !config.dest) {
    quench.throwError(
      "SvgSprite task requires src and dest!\n",
      `Was given ${JSON.stringify(config, null, 2)}`,
    );
  }

  const svgSprite = () => {
    return gulp
      .src(config.src, { base: config.base })
      .pipe(quench.drano())
      .pipe(svgstore({ inlineSvg: false }))
      .pipe(rename(config.filename))
      .pipe(gulp.dest(config.dest))
      .pipe(debug({ title: config.debugTitle }));
  };

  quench.maybeWatch(config.watch || config.src, svgSprite, config.debugTitle);

  return svgSprite();
};
