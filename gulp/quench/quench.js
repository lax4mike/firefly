/**
 *    Quench: utilities for gulp builds
 *    v5.9.1
 *
 * Exposed functions: (see function comments for more details)
 *   setDefaults
 *   loadLocalJs
 *   getEnv
 *   isWatching
 *   maybeWatch
 *   drano
 *   resolvePath
 *   logHelp
 *   logYellow
 *   logError
 *   throwError
 */

/* eslint-disable no-console */

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const notify = require("gulp-notify");
const env = require("gulp-environments");
const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const R = require("ramda");
const slash = require("slash");

const environments = ["development", "production", "local"];

/**
 * yargOptions: command line flags
 *              (see quench.setDefaults to override)
 *
 *   --watch defaults to true
 *           can do --no-watch to set it to false
 *
 *   --env defaults to "local"
 *         see environments above for other values
 *
 *   eg. gulp build --no-watch --env production
 */
const yargOptions = {
  watch: {
    default: true,
    type: "boolean",
  },
  env: {
    default: "local",
    type: "string",
  },
};

const yargs = require("yargs").options(yargOptions);

/**
 * load local.js when this file is loaded
 */
const localJsPath = path.join(__dirname, "..", "local.js");
const localJs = fs.existsSync(localJsPath) ? require(localJsPath) : {};

/**
 * initialize gulp-environments with our environments above
 * https://github.com/gunpowderlabs/gulp-environments
 */
environments.forEach(function (environment) {
  env[environment] = env.make(environment);
});

/**
 * set the environment
 * @param {String} _env the environment to use
 * @return {Nothing} nothing
 */
function setEnv(_env) {
  // this might be called multiple times, abort if this _env is already set
  if (process.env.NODE_ENV === _env) {
    return;
  }

  // validate the env
  if (environments.indexOf(_env) === -1) {
    throwError(
      `Environment '${_env}' not found! Check your spelling or add a new environment in quench.js.\n`,
      `Valid environments: ${environments.join(", ")}`,
    );
  }

  // set NODE_ENV https://facebook.github.io/react/downloads.html#npm
  process.env.NODE_ENV = _env;

  // set gulp-environments
  env.current(env[_env]);

  console.log(chalk.green(`Building for '${_env}' environment`));
}

/**
 * set the defaults for yargOptions.  See yargOptions above for current defaults.
 * @param  {Object} lookup lookup of the yargOptions defaults
 *    eg. quench.setDefaults({
 *          "env": "production", // << one of environments
 *          "watch": false
 *        });
 * @return {Nothing} nothing
 */
module.exports.setDefaults = function setDefaults(lookup) {
  // [watch, env]
  const validArgs = R.keys(yargOptions);

  // make sure all the given keys are in the yargOptions
  const valid = R.compose(R.all(R.includes(R.__, validArgs)), R.keys)(lookup);

  if (!valid) {
    throwError(
      "quench.setDefaults can only set the following: ",
      `${validArgs.join(", ")}\n`,
      `given: ${JSON.stringify(lookup, null, 2)}`,
    );
  }

  const newYargOptions = R.map((value) => ({ default: value }), lookup);

  // set the new options
  yargs.options(newYargOptions);
};

/**
 * @return {Object} the contents of local.js
 */
module.exports.loadLocalJs = function loadLocalJs() {
  return localJs;
};

/**
 * getEnv
 * https://github.com/gunpowderlabs/gulp-environments
 * @return {Function} an instance of gulp-environments
 */
module.exports.getEnv = function getEnv() {
  // make sure the environment is set first, setEnv will abort if it's already set
  setEnv(yargs.argv.env);

  return env;
};

/**
 * Returns the value of yargs.argv.watch
 * the cli can change it by adding options:
 *   --watch     << true
 *   --no-watch  << false
 *               << undefined
 * it can also be changed in code via quench.setDefaults
 * @return {Boolean} true, false, or undefined
 */
const isWatching = (module.exports.isWatching = function isWatching() {
  return yargs.argv.watch;
});

/**
 * watches the glob if yargs.argv.watch is true
 * @param  {String} glob: files to watch
 * @param  {Function} task: *optional - task to run
 * @param  {string} taskName: *optional - label to display in the terminal
 * @return {Nothing} nothing
 */
module.exports.maybeWatch = function maybeWatch(glob, task, taskName) {
  // if we're watching
  if (yargs.argv.watch) {
    // alert the console that we're watching
    logYellow(
      "watching",
      taskName || `${task.name}:` || "",
      JSON.stringify(glob, null, 2),
    );

    return gulp.watch(glob, task);
  }
};

/**
 * drano: make plumber with error handler attached
 * see https://www.npmjs.com/package/gulp-plumber
 * eg: .pipe(quench.drano())
 * NOTE: gulp 4 provides this functionality and good error messages, but drano
 *       provides the notification, so we'll still use this.
 * @return {Function} augmented plumber
 */
module.exports.drano = function drano() {
  return plumber({
    errorHandler: function (error) {
      // gulp notify is freezing jenkins builds, so we're only going to show this message if we're watching
      if (isWatching()) {
        notify.onError({
          title: "<%= error.plugin %>",
          message: "<%= error.message %>",
          sound: "Beep",
        })(error);
      } else {
        // log this error and set the exit code to 1 (failure)
        // but let gulp continue so it can catch more errors if there are some.
        logError(error.plugin + ": " + error.message);
        process.exitCode = 1;
      }

      // this allows the rest of the pipeline to continue
      // eg. will flow through gulp-debug
      this.emit("end");
    },
  });
};

/**
 * resolvePath: A replacement for path.resolve that will convert \\ to / so watching will work on windows
 * use this instead of path.resolve
 * https://github.com/paulmillr/chokidar/issues/668#issuecomment-357235531
 * https://github.com/paulmillr/chokidar/issues/777#issuecomment-440119621
 *
 * @param {String} p : the path to be resolved
 * @return {String} a path with all \\ converted to /
 */
module.exports.resolvePath = function resolvePath(...p) {
  return slash(path.resolve(...p));
};

/**
 * log out a help message, including available gulp tasks and --watch/env details
 * @return {Nothing} will print to the console
 */
module.exports.logHelp = function logHelp(cb) {
  const indent = " ";
  const code = chalk.yellow;

  console.log("");
  console.log(`Available gulp ${chalk.cyan("<task>")} commands: `);
  console.log("");

  R.compose(
    R.forEach((task) => {
      const { displayName, description } = task;
      console.log(indent, chalk.cyan(displayName));

      if (description) {
        console.log(indent, indent, description);
      }
    }),
    R.filter((task) => task.displayName !== "default"),
    R.map((task) => {
      const description = task.unwrap().description;
      const displayName = task.displayName;
      return { displayName, description };
    }),
    R.values,
  )(gulp.registry().tasks());

  console.log("");
  console.log("");

  console.log(chalk.bold("Watching"));
  console.log(indent, "By default, all tasks will run with `watch` as true.");
  console.log(
    indent,
    `You can pass ${code("--no-watch")} to disable watching.`,
  );

  console.log("");

  console.log(chalk.bold("Environments"));
  console.log(indent, "By default, the environment is set to `local`.");
  console.log(
    indent,
    `You can override this by passing ${code("--env")} [anotherEnv].`,
  );
  const envs = environments.map((env) => `"${env}"`).join(", ");
  console.log(indent, `Valid environments are ${envs}`);

  console.log("");

  console.log(chalk.bold("Continuous integration"));
  console.log(
    indent,
    "To avoid relying on the global gulp, it can be run from node_modules.",
  );
  console.log(
    indent,
    "A common command for building projects for Jenkins, etc:",
  );
  console.log(
    indent,
    indent,
    code("node_modules/.bin/gulp build --no-watch --env production"),
  );

  console.log("");
  console.log("");
  console.log("");

  cb();
};

/**
 * logYellow: will log the output with the first arg as yellow
 * eg. logYellow("watching", "css:", files) >> [watching] css: ["some", "files"]
 * @return {Nothing} nothing
 */
const logYellow = (module.exports.logYellow = function logYellow() {
  const args = Array.prototype.slice.call(arguments);
  const first = args.shift();

  if (args.length) {
    const argString = args
      .map(function (arg) {
        return typeof arg === "object" ? JSON.stringify(arg) : arg.toString();
      })
      .join(" ");

    console.log("[" + chalk.yellow(first) + "]", argString);
  }
});

/**
 * logError: will log the output in red
 * @return {Nothing} nothing
 */
const logError = (module.exports.logError = function logError() {
  const args = Array.prototype.slice.call(arguments);

  if (args.length) {
    const argString = args
      .map(function (arg) {
        // return (typeof arg  === "object") ? JSON.stringify(arg) : arg.toString();
        return arg.toString();
      })
      .join("");

    console.log("[" + chalk.red("error") + "]", chalk.red(argString));
  }
});

/**
 * throwError: will log the output in red, and log out the stack trace.
 * This will also stop the node process.
 * @return {Nothing} nothing
 */
const throwError = (module.exports.throwError = function throwError() {
  logError(...arguments);

  throw new Error("quench.throwError stack trace: ");
});
