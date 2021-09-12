const gulp = require("gulp");
const quench = require("./quench.js");
const gulpSass = require("gulp-dart-sass");
const rename = require("gulp-rename");
const debug = require("gulp-debug");
const header = require("gulp-header");
const concat = require("gulp-concat");
const gulpif = require("gulp-if-else");
const sourcemaps = require("gulp-sourcemaps");
const cleancss = require("gulp-clean-css");
const R = require("ramda");
const numeral = require("numeral");

const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const postcssPresetEnv = require("postcss-preset-env");
const postcssEncodeBackgroundSVGs = require("postcss-encode-background-svgs");

module.exports = function runSassTask(userConfig = {}) {
  const env = quench.getEnv();

  const defaultConfig = {
    sass: {
      // not using "compressed" for production anymore https://github.com/gulp-sourcemaps/gulp-sourcemaps/issues/60
      outputStyle: "expanded",
    },

    debugTitle: "sass:",

    cleancss: {
      level: 2,
      debug: false,
    },

    cleancssCallback: function logCleancss(details) {
      const original = numeral(details.stats.originalSize).format("0.0 b");
      const minified = numeral(details.stats.minifiedSize).format("0.0 b");
      const efficiency = numeral(details.stats.efficiency).format("0%");
      quench.logYellow(
        "clean-css",
        `${details.name}: ${original} -> ${minified} (${efficiency})`,
      );
    },

    // the order matters
    postcssPlugins: [
      autoprefixer(
        userConfig.autoprefixer || {
          // browsers:  browser list is defined in .browserlistrc
          grid: "autoplace",
        },
      ),
      postcssEncodeBackgroundSVGs,
      postcssPresetEnv(userConfig.postcssPresetEnv || { stage: 3 }),
    ],

    postcssOptions: {},

    /**
     * src      : glob of css files to compile
     * dest     : destination folder
     * filename : *optional, name of output file (-generated will be appended)
     *            will concat all input files into this filename
     * watch    : *optional, files to watch that will trigger a rerun when changed
     *            defaults to src
     */
  };

  const config = R.mergeDeepRight(defaultConfig, userConfig);

  if (!config.src || !config.dest) {
    quench.throwError(
      "Css task requires src and dest!\n",
      `Was given ${JSON.stringify(config, null, 2)}`,
    );
  }

  const sass = () => {
    return gulp
      .src(config.src, { base: config.base })
      .pipe(quench.drano())
      .pipe(sourcemaps.init())
      .pipe(gulpSass(config.sass))
      .pipe(postcss(config.postcssPlugins, config.postcssOptions))
      .pipe(
        gulpif(
          // concat the css if the filename is provided
          config.filename,
          () => concat(config.filename),
        ),
      )
      .pipe(
        gulpif(
          // only add the header text if this css isn't compressed
          config.sass && config.sass.outputStyle !== "compressed",
          () => header("/* This file is generated.  DO NOT EDIT. */ \n"),
        ),
      )
      .pipe(
        rename({
          suffix: "-generated",
        }),
      )
      .pipe(
        gulpif(env.production(), () =>
          cleancss(config.cleancss, config.cleancssCallback),
        ),
      )
      .pipe(sourcemaps.write("./"))
      .pipe(gulp.dest(config.dest))
      .pipe(debug({ title: config.debugTitle }));
  };

  quench.maybeWatch(config.watch || config.src, sass, config.debugTitle);

  return sass();
};
