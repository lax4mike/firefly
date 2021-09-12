# Gulp

## Setup

### Once per computer

1.  Install LTS version of node from [https://nodejs.org/](https://nodejs.org/)
2.  Install gulp globally:  
    `npm install -g gulp-cli`

### Once per project

1.  Navigate to the folder containing `package.json`, normally in the the project root.
2.  Install node dependancies via
    `npm install`

This will add gulp and all the other packages that it
needs to compile css, etc. All these dependancies get installed to the
`node_modules` folder. If things get messed up, you can delete this
folder and reinstall.

## Running tasks

1.  Navigate to the folder containing `gulpfile.js`, normally in the project.

2.  Run `gulp` to run the default task or `gulp [taskname]` to run a specific task. Often, `gulp` will print a list of available tasks.

The actual gulp tasks will vary by project. Look in `gulpfile.js` for exports. Any exported functions from `gulpfile.js` will be registered into gulp's task system. See https://gulpjs.com/docs/en/getting-started/creating-tasks

The watcher will normally start a [browserSync](https://browsersync.io/) server. The console will tell you the exact port, but it usually runs on [http://localhost:3000/](http://localhost:3000/).

### Watching

All tasks will watch by default. What they watch is configured on a task by task basis.

To disable watching, use `--no-watch` when you run the `gulp` command.

> `quench.isWatching()` is available to get this value programmatically in a gulp task.  
> `quench.setDefaults()` is available to set the default value to false if needed.  
> `quench.maybeWatch()` will start a watcher if the value of watch is true.

### Environments

You can set the environments by using `--env [anotherEnv]` when you run the `gulp` command. Valid environments are `local`, `development`, `production`. `local` is used by default.

> `quench.getEnv()` is available to get this value programmatically in a gulp task. See https://github.com/gunpowderlabs/gulp-environments for usage.  
> `quench.setDefaults()` is available to set the default environment if needed.

### Continuous Integration

For Jenkins, or other continuous integrations, it's common to run the tasks without watching and for the production environment. Also, to avoid relying on the global `gulp` command, it's advisable to run gulp directly from the `node_modules` folder. For example:

```
node_modules/.bin/gulp build --no-watch --env production
```

### `local.js`

Occasionally, it's helpful for developers to have a configuration specific to their machine. For example, if a gulp task needs to proxy an already running site. For these types of configuration, we can use `local.js`. This file should export a javascript object with configuration values.

To access this configuration inside a gulp task, you can use `quench.loadLocalJs()`:

```javascript
const localConfig = quench.loadLocalJs();
```

See [`local.js.example`](./local.js.example) for an example. This file is already set up with `proxy` and `browserSyncPort` values, which are used by [`runBrowserSyncTask.js`](./quench/runBrowserSyncTask.js). See [`runBrowserSyncTask.js`](./quench/runBrowserSyncTask.js) for an example of how to use `quench.loadLocalJs()`.

`local.js` should **not** be checked in to source control.

## Writing tasks

To write tasks, you'll need an understanding of [Gulp v4](https://gulpjs.com/). Read through the [getting started](https://gulpjs.com/docs/en/getting-started/quick-start) documentation and become familiar with gulp's [API](https://gulpjs.com/docs/en/api/concepts).

### The `/quench` folder

The `/quench` folder contains `quench.js`, which provides helper functions for various things. See [`quench.js`](./quench/quench.js) for more details, it's well documented.

The `/quench` folder also contains various `run*Task.js` helper functions for common tasks. These include [`runSassTask`](./quench/runSassTask.js), [`runJsTask`](./quench/runJsTask.js), [`runCopyTask`](./quench/runCopyTask.js) and more. See [`createBuildTasks.js`](./tasks/createBuildTasks.js) for example usage and `run*Task.js` for documentation on each task.


### `runBrowserSyncTask.js`

[Browsersync](https://www.browsersync.io/) is a dev server that allows us to run a website locally on a developer's machine. There are three main ways to use this:

1. **Proxy a remote development server.**

   When working on just javascript and css, it's possible for the user to proxy a shared development server. To do this, you want to define the `proxy` field in `local.js` (see the [local.js](#localjs) section above). Here's an example of `local.js`:

   ```json
   {
     "proxy": "http://dev.my-project.com"
   }
   ```

   See https://browsersync.io/docs/options#option-proxy for more info.

   > If your site runs on `https`, you want to include that in the proxy address and you'll want to use the `https` option when defining your `browserSync` task. See https://browsersync.io/docs/options#option-https for more info.

   In this case, we want to serve the local `.js` and `.css` files from the developers machine. We can do this with the option `serveStatic`:

   ```javascript
   const browserSync = () =>
     runBrowserSyncTask({
       // proxy: defined in local.js
       serveStatic: [
         {
           route: "/assets/build",
           dir: `${websiteDir}/build`
         }
       ],
       files: [`${websiteDir}/build/**`]
     });
   ```

   See https://browsersync.io/docs/options#option-serveStatic and https://browsersync.io/docs/options#option-serveStaticOptions for more info.

   You can also target specific files using the [`rewriteRules`](https://browsersync.io/docs/options#option-rewriteRules) option, if you need more granular control.

1. **Serve the website from the developer's machine.**

   If the website is entirely hosted on the developer's machine, you can set up browser sync to run from a base directory. This would mostly be for small prototype sites that don't have any backend code and just need to statically serve the files.

   ```javascript
   const browserSync = () =>
     runBrowserSyncTask({
       server: `${projectRoot}/build`
     });
   ```

   This server will automatically reload when any file in `${projectRoot}/build` changes.

   See https://browsersync.io/docs/options#option-server for more info.

1. **Proxy a local server.**

   Sometimes (but not often for front-end developers), the developer will have a website running on a server on their machine already (eg. via IIS). In this case, we can _proxy_ that server and still get the reload benefits of browsersync. You'll set up the `proxy` in `local.js` the same way as for a development server, but use the local url instead.

   The same `https` considerations as above apply here.

   ```json
   {
     "proxy": "http://my-project.mlambert.com"
   }
   ```

   The proxy from `local.js` will automatically be passed to browsersync. However, you'll still want to define a `files` field in the `browserSync` task so it knows when to refresh.

   ```javascript
   const browserSync = () =>
     runBrowserSyncTask({
       // proxy: defined in local.js
       files: `${projectRoot}/build`
     });
   ```

   See https://browsersync.io/docs/options#option-files for more info.

### The `/tasks` folder

This is where all the tasks needed for this particular project are defined. [`createBuildTasks.js`](./tasks/createBuildTasks.js) is an example, so this should be updated or replaced to suit this project's needs.

In general, you'll want a separate file for each discrete build tasks (but feel free to create helper files if needed). These files should export factory functions that will usually take the `projectRoot` as an argument, create multiple sub tasks (usually using the `run*Task.js` from quench), and _compose_ them together with [`gulp.series`](https://gulpjs.com/docs/en/api/series) and/or [`gulp.parallel`](https://gulpjs.com/docs/en/api/parallel). See [`createBuildTasks.js`](./tasks/createBuildTasks.js) for examples and read gulp's [documentation](https://gulpjs.com/docs/en/getting-started/creating-tasks#compose-tasks) on composing tasks.

You will then use this factory function in `gulpfile.js` to [expose](https://gulpjs.com/docs/en/getting-started/creating-tasks) it to the gulp command line. Be sure to add helpful description text that describes what the task does:

```javascript
const createBuildTasks = require("./tasks/createBuildTasks.js");

const build = createBuildTasks(projectRoot);
build.description = "Build frontend assets";
exports.build = build;
```

Now, we can run `gulp build` from command line to execute this task.

A reason to use a factory function is that we can very easily add parameters to make this function more powerful and flexible. For example, in `createBuildTasks.js`, instead of hardcoding the `buildDir`, we could accept it as an argument. This way, we could reuse this task for two different build targets, for example:

```javascript
exports.sitecore = createBuildTasks({
  projectRoot,
  buildDir: "path/to/sitecore/"
});

exports.patternlab = createBuildTasks({
  projectRoot,
  buildDir: "path/to/patternlab/"
});
```

### Other quench functions

We've already seen `quench.isWatching()`, `quench.setDefaults()`, `quench.maybeWatch()`, `quench.getEnv()`, and `quench.loadLocalJs()` above. Here are some other functions are helpful when creating custom tasks.

See [`quench.js`](./quench/quench.js) for more details about these functions.

#### `quench.resolvePath()`

There is a bug in windows where watchers do not work if the paths use `\\` instead of `/`. Node's [path](https://nodejs.org/docs/latest/api/path.html) functions return `\\`, so use `quench.resolvePath()` instead of `path.resolve()`. For example, in `createBuildTasks.js`:

```javascript
const projectRoot = quench.resolvePath(__dirname, "..");
```

For reference, these are the issues:

- https://github.com/paulmillr/chokidar/issues/668#issuecomment-357235531
- https://github.com/paulmillr/chokidar/issues/777#issuecomment-440119621

#### `quench.logHelp()`

A helper function that logs out all available gulp tasks and other help information to the console. This should be attached to the default task in `gulpfile.js`:

```javascript
exports.default = quench.logHelp;
```

#### `quench.drano()`

A pre-configured version of [`gulp-plumber`](https://github.com/floatdrop/gulp-plumber). Use this immediately after `gulp.src` to nicely handle errors.

```javascript
return gulp
  .src(src)
  .pipe(quench.drano())
  .pipe(/* other plugins */);
```

#### `quench.logYellow()`

This will log the output with the first arg as yellow
eg. `logYellow("watching", "css:", files)` >> `[watching] css: ["some", "files"]` where _[watching]_ is yellow. This is useful for reporting things to the user in the terminal.

#### `quench.logError()`

Will log the arguments to the console in red prefixed with _[error]_. Execution of the task will continue.

#### `quench.throwError()`

Will log the arguments to the console in red prefixed with _[error]_ along with a stack trace. This will also stop the task execution.
