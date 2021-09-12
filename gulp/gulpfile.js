/**
 *  See ./readme.md for usage
 **/
const gulp = require("gulp");
const quench = require("./quench/quench.js");

const projectRoot = quench.resolvePath(__dirname, "..");

const createBuildTasks = require("./tasks/createBuildTasks.js");
const { build, browserSync } = createBuildTasks(projectRoot);

/**
 * gulp build
 *
 * to build for production/jenkins:
 *    node_modules/.bin/gulp build --no-watch --env production
 */
const buildTask = gulp.series(build, browserSync);
buildTask.description = "Build frontend assets";
exports.build = buildTask;

exports.default = quench.logHelp;
