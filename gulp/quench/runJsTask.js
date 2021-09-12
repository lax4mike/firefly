const gulp = require("gulp");
const quench = require("./quench.js");
const uglify = require("gulp-uglify");
const rename = require("gulp-rename");
const debug = require("gulp-debug");
const notify = require("gulp-notify");
const sourcemaps = require("gulp-sourcemaps");
const browserify = require("browserify");
const babelify = require("babelify");
const through2 = require("through2");
const vinylSource = require("vinyl-source-stream");
const vinylBuffer = require("vinyl-buffer");
const findup = require("find-up");
const detective = require("detective-es6");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const R = require("ramda");
const findBabelConfig = require("find-babel-config");

/**
 * runJsTask : given a list of entry files, transpile all of them with babel and
 * bundle with browserify. Additionally, a `libraries-generated.js` file will be
 * created that contains all the npm modules.  Make sure `libraries-generated.js`
 * gets included on the page before any other files. For example:
 *
 *   <script type="text/javascript" src="js/libraries-generated.js"></script>
 *   <script type="text/javascript" src="js/index-generated.js"></script>
 *
 * to omit generating a separate libraries file all together, use the libraries
 * option below (or standalone: false on all files)
 *
 * @param  {Object} userConfig : see defaultConfig below
 * @return {Promise} a Promise that runs all the file tasks and the libraries task
 */
module.exports = function runJsTask(userConfig) {
  const env = quench.getEnv();

  const defaultConfig = {
    uglify: {},

    browserify: {
      debug: true, // enable sourcemaps always, even for production
    },

    // array or string of globs of files to watch to rerun the entire task
    watch: [],

    /**
     * Add new entry javascript files to the files array
     * keys:
     *   entry       : path to this file
     *   base        : *optional
     *   dest        : *optional, directory to write the file, if different from config.dest
     *   filename    : name for the generated file (-generated will be appended)
     *   standalone  : *optional, Boolean, whether or not to include npm packages in libraries-generated.js.
     *                 - don't include files that have "standalone: true"
     *   watch       : rerun this files's task when these files change (can be an array of globs)
     **/
    files: [],

    // libraries: the filename for the libraries-generated.js file or false to omit
    libraries: "libraries.js",
  };

  const config = R.mergeDeepRight(defaultConfig, userConfig);

  if (!config.dest) {
    quench.throwError(
      "Js task requires a dest!\n",
      `Given config: ${JSON.stringify(config, null, 2)}`,
    );
  }

  const files = resolveEntryGlobs(config.files);

  // a function to look in all the files to find what npm packages are being used
  // if config.libraries is false, always return an empty array
  const getNpmPackages = config.libraries
    ? createNpmPackagesGetter(files, bundleLibraries)
    : () => [];

  /* 1. Create a gulp task and watcher for each file in the files array */

  const fileTasks = files.map((fileConfig) => {
    if (!fileConfig.entry || !fileConfig.filename) {
      quench.throwError(
        "Js task requires that each file has an entry and a filename!\n",
        `Given fileConfig: ${JSON.stringify(fileConfig, null, 2)}`,
      );
    }

    // create a gulp task to compile this file
    function jsFile() {
      // get an updated array of common packages
      const npmPackages = getNpmPackages();

      // using Promise so we can do Promise.all below
      return new Promise((resolve, reject) => {
        gulp
          .src(fileConfig.entry, { base: fileConfig.base })
          .pipe(quench.drano())
          .pipe(bundleJs(config.browserify, npmPackages))
          .pipe(sourcemaps.init({ loadMaps: true })) // loads map from browserify file
          .pipe(env.production(uglify(config.uglify)))
          .pipe(rename(fileConfig.filename))
          .pipe(
            rename({
              suffix: "-generated",
            }),
          )
          .pipe(sourcemaps.write("./"))
          // write to this file's info dest, or fallback to the js config.dest
          .pipe(gulp.dest(fileConfig.dest || config.dest))
          .pipe(debug({ title: `${fileConfig.filename}:` }))
          .on("finish", resolve)
          .on("error", reject);
      });
    }

    // register the watcher for this task
    quench.maybeWatch(fileConfig.watch, jsFile, fileConfig.filename);

    return jsFile();
  });

  /* 2. Create a special task to compile all the npm packages into libraries.js */

  // this must be run manaully once initially, this allows for the parent task
  // to wait for libraries to finish.
  // subsequently, it will be run when needed via getNpmPackages()
  function bundleLibraries() {
    const npmPackages = getNpmPackages();

    // don't run this task if we dont' have any packages to bundle
    if (R.isNil(npmPackages) || R.isEmpty(npmPackages)) {
      return Promise.resolve("skipping bundling libraries");
    }

    // when we add `global` below, it doesn't read from .babelrc automatically.
    // so we need to manually merge global in with the .babelrc config
    const babelConfig = findBabelConfig.sync(__dirname);

    // will expose npmPackages, eg. "react"
    // http://stackoverflow.com/questions/30294003/how-to-avoid-code-duplication-using-browserify/30294762#30294762
    const b = browserify(config.browserify)
      .require(npmPackages)
      .transform(babelify, {
        ...babelConfig.config,
        // https://github.com/babel/babelify/issues/276
        // global will transpile all node_modules, for IE when packages have =>
        // only do this on production because it's slow
        global: env.production(),
        // core-js breaks when the symbols packages is transpiles, so lets not transpile core-js
        // https://github.com/zloirock/core-js/issues/514#issuecomment-476533317
        ignore: env.production()
          ? [
              quench.resolvePath("node_modules/core-js"),
              quench.resolvePath("node_modules/d3"),
            ]
          : undefined,
      }); // see .babelrc for settings

    quench.logYellow("npm packages", JSON.stringify(npmPackages, null, 2));

    return new Promise((resolve, reject) => {
      b.bundle()
        .pipe(vinylSource(config.libraries)) // make the browserify stream work with gulp
        .pipe(vinylBuffer()) // for sourcemaps https://github.com/gulpjs/gulp/issues/369#issuecomment-52098832

        .pipe(quench.drano())
        .pipe(sourcemaps.init({ loadMaps: true })) // loads sourcemaps from browserify file
        .pipe(env.production(uglify(config.uglify))) // only run in production
        .pipe(
          rename({
            suffix: "-generated",
          }),
        )
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest(config.dest))
        .pipe(debug({ title: `${config.libraries}:` }))
        .on("finish", resolve)
        .on("error", function (e) {
          notify.onError({
            title: config.libraries,
            message: e,
            sound: "Beep",
          })(e);
          this.emit("end"); // end this stream
          reject();
        });
    });
  }

  /* 3. Create a task function to run them all */

  // using Promise.all instead of gulp.parallel because gulp.parallel won't trigger
  // async completion https://gulpjs.com/docs/en/getting-started/async-completion
  const js = () => Promise.all([bundleLibraries(), ...fileTasks]);

  // if the user hasn't `npm init` for some reason, package.json might be missing
  const packageJsonFile = findup.sync("package.json");

  if (!packageJsonFile) {
    throw new Error(
      "Can't find package.json!  It shoud be at the root of your project.",
    );
  }

  // if package.json changes, re-run all js tasks
  quench.maybeWatch(R.unnest([config.watch, packageJsonFile]), js);

  return js();
};

/**
 * the entry path can be in glob format.  This function will ensure that the glob
 * only matches one file
 * @param  {Array} files : fileConfig objects from config (above)
 * @return {Array} files with globs resolved to a single file
 * @throws if the glob doesn't match exactly one file
 */
function resolveEntryGlobs(files) {
  return R.map((file) => {
    // entry could be in glob syntax, eg. "index.js?(x)"
    const globPath = file.entry;
    const matches = glob.sync(globPath);

    if (matches.length === 0) {
      quench.throwError(
        "runJsTask: No files were found that matches the glob:\n",
        `  ${globPath}\n`,
      );
    } else if (matches.length > 1) {
      quench.throwError(
        "runJsTask: More than one file was found for the glob: \n",
        `  ${globPath}\n\n`,
        "  The javascript 'entry' field should match only one file.",
      );
    }
    // will only compile the first one
    return R.assoc("entry", matches[0], file);
  })(files);
}

/**
 * factory function to return "getNpmPackages"
 * eg. const getNpmPackages = createNpmPackagesGetter(config.files, bundleLibraries);
 * @param  {Array} files - Array of file objects (see config.files) (object with .entry key)
 * @param  {Function} librariesTask - the gulp task for the libraries bundle
 * @return {Function} see below
 */
function createNpmPackagesGetter(files, librariesTask) {
  const findUsedNpmPackages = (files) =>
    R.compose(
      R.uniq,
      R.flatten,
      R.map(R.compose(findAllNpmDependencies, R.prop("entry"))),
      R.reject(R.propEq("standalone", true)),
    )(files);

  // keep track of the result last time this was run
  // it will start populated, so librariesTask() must be run manually initially.
  // this allows for the parent task to wait for librariesTask to finish
  let lastCommonPackages = findUsedNpmPackages(files);

  /**
   * helper to get an array of all the npm dependencies from all the files
   *   and run the librariesTask if they've changed
   * @return {Array} Array of strings
   */
  return function getNpmPackages() {
    // eg. ["react", "react-dom", ...]
    const npmPackages = findUsedNpmPackages(files);

    // if the list is different, re-run librariesTask
    if (!R.equals(lastCommonPackages, npmPackages)) {
      lastCommonPackages = npmPackages;
      librariesTask();
    }

    return npmPackages;
  };
}

/**
 * Create a bundle of the files in the stream using browserify
 * @param  {Object} browserifyOptions - Options to pass to browserify
 * @param  {Array} npmPackages - array of strings of npm package names to be externalized
 * @return {Stream} a gulp stream transform
 */
function bundleJs(browserifyOptions, npmPackages = []) {
  return through2.obj(function (file, enc, callback) {
    // https://github.com/substack/node-browserify/issues/1044#issuecomment-72384131
    const b = browserify(browserifyOptions || {}) // pass options
      .add(file.path) // this file
      .transform(babelify, {
        global: true,
      }); // babel config should be in .babelrc

    // externalize common packages
    // http://stackoverflow.com/questions/30294003/how-to-avoid-code-duplication-using-browserify/30294762#30294762
    try {
      npmPackages.forEach(function (p) {
        b.external(p);
      });
    } catch (e) {
      quench.logError("createJsTask: error externalizing npm packages\n", e);
    }

    b.bundle(function (err, res) {
      if (err) {
        callback(err, null); // emit error so drano can do it's thang
      } else {
        file.contents = res; // assumes file.contents is a Buffer
        callback(null, file); // pass file along
      }
    });
  });
}

/**
 * findAllNpmDependencies: given an entry entryFilePath, recurse through the
 *   imported files and find all npm modules that are imported
 * @param  {String} entryFilePath - eg. "app/js/index.js"
 * @param  {Array} omitFilePaths - array of file paths to exclude from checking.
 *   ie. files that we've already checked (to avoid infinite loops on circular
 *   dependencies when recursing)
 *   The initial call to findAllNpmDependencies can omit this
 * @return {Array} an array of package names (strings).
 *                 eg ["react", "react-dom", "classnames"]
 */
function findAllNpmDependencies(entryFilePath, omitFilePaths = []) {
  try {
    // eg. import "./polyfill", resolve it to "./polyfill.js" or "./polyfill/index.js"
    const entryFile = require.resolve(entryFilePath);

    // list of all imported modules and files from the entryFilePath
    // eg. ["react", "../App.jsx"]
    const imports = detective(fs.readFileSync(entryFile, "utf8")).map(
      (moduleOrFilePath) => {
        // if this is a relativePath (begins with .), then resolve the path
        // from the current entryFilePath directory name
        // running through require.resolve because eg. "./polyfill" won't exist
        return R.test(/^(\.)/, moduleOrFilePath)
          ? require.resolve(
              quench.resolvePath(path.dirname(entryFile), moduleOrFilePath),
            )
          : moduleOrFilePath;
      },
    );

    // list of all the modules in this entryFilePath
    const modules = R.reject(fs.existsSync, imports);

    // a list of all the imported files, excluding files we've already checked
    const recurseOnTheseFiles = R.compose(
      R.reject(R.includes(R.__, omitFilePaths)), // avoid inifite loops
      R.filter(fs.existsSync), // only look in files, not modules
    )(imports);

    // list of all the modules in imported files
    // chain will recurse, concat, and flatten
    const importedFilesModules = R.chain((entry) =>
      // pass along a new list of what files we've checked
      findAllNpmDependencies(entry, [...recurseOnTheseFiles, ...omitFilePaths]),
    )(recurseOnTheseFiles);

    // a set of the modules from this file + the modules from imported paths
    const allModules = R.uniq(R.concat(modules, importedFilesModules));

    return allModules;
  } catch (e) {
    quench.logError("findAllNpmDependencies failed :( ", e);
    return [];
  }
}
