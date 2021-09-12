const gulp = require("gulp");
const runCopyTask = require("../quench/runCopyTask.js");
const runJsTask = require("../quench/runJsTask.js");
const runSassTask = require("../quench/runSassTask.js");
const runBrowserSyncTask = require("../quench/runBrowserSyncTask.js");

module.exports = function createBuildTasks(projectRoot) {
  const buildDir = `${projectRoot}/build`;
  const appDir = `${projectRoot}/app`;

  const copy = () =>
    runCopyTask({
      src: [`${appDir}/index.html`, `${appDir}//img/**/*.svg`],
      dest: buildDir,
      base: `${appDir}`,
    });

  const js = () =>
    runJsTask({
      dest: `${buildDir}/js/`,
      files: [
        {
          entry: `${appDir}/js/index.js?(x)`, // .js or .jsx
          filename: "index.js",
          watch: [`${appDir}/js/**/*.js`, `${appDir}/js/**/*.jsx`],
        },
      ],
    });

  const sass = () =>
    runSassTask({
      src: [`${appDir}/scss/**/*.scss`, `${appDir}/js/**/*.scss`],
      dest: `${buildDir}/css/`,
      watch: [`${appDir}/scss/**/*.scss`, `${appDir}/js/**/*.scss`],
      filename: "index.css",
    });

  const browserSync = () =>
    runBrowserSyncTask({
      server: buildDir,
    });

  const build = gulp.parallel(copy, sass, js);

  return {
    build,
    browserSync,
  };
};
