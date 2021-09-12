const { spawn } = require("child_process");
const R = require("ramda");
const quench = require("./quench.js");
const chalk = require("chalk");

/**
 * @param  {String} command some command to run on the command line
 *   eg. const storybook = () => runCmd("node_modules/.bin/start-storybook --port 3030");
 *   eg. const storybook = () => runCmd("npm run storybook");
 * @param  {Array} args see https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 * @param  {Object} options see https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options
 * @return {Promise} a resolved promise of the child process (needed for gulp async completion)
 *                   https://gulpjs.com/docs/en/getting-started/async-completion/
 */
module.exports = function runCommand(command, args = [], options = {}) {
  const spawnProcess = spawn(command, args, {
    shell: true,
    stdio: "inherit", // show output in process.stdout, etc
    ...options,
  });

  // get the command from the spawnargs because it will include the args.
  // eg. spawn("start-storybook", ["--port", 3030]) will be "start-storybook --port 3030"
  quench.logYellow(
    "Running command",
    chalk.green(`${R.path(["spawnargs", 2], spawnProcess)}`),
  );

  // let gulp know this task is finished
  // https://gulpjs.com/docs/en/getting-started/async-completion
  return Promise.resolve(spawnProcess);
};
