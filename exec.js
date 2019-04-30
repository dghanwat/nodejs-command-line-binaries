// Extract the execute function from the child_process module
const exec = require("child_process").exec;

/**
 * child_process.exec(command[, options][, callback])
 * command - Command to execute. You can have space separated arguments if the command accepts any args
 * options - You can give options like Environment variables required for child process
 * callback - function which will be called with the output when process terminates.
 *           error - If any errors are thrown during the process exception
 *           stdout - Any data that gets returned by the process
 *           stderr - Any error that is logged by the process
 */
exec("git version",function(err,stdout) {
    // If there is an error executing `git version` like git not found, then
    // throw it back
    if(err) {
        throw err;
    }

    console.log("Git version finished");
    // Log the output received from the child process
    console.log(stdout);
});