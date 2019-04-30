// Extract the spwan function from the child_process module
const spawn = require('child_process').spawn;

/**
 * child_process.spawn(command[,args][, options])
 * command - Command to execute. for example node, python etc
 * args - List of String Arguments. Generally first is the name of binary that would run in the terminal
 * options - You can give options like Environment variables required for child process
 */
const  py = spawn('python', ['long_running_process.py']);

// Listen for data event, in other works when ever there is a 
// data event this call back function will be fired
py.stdout.on('data', function(data){
    console.log(`STDOUT: ${data.toString()}`)
});

// Listen for Close event. when child process closes this function will be 
// invoked
py.on('close', function(){
   console.log('End of child process');
   process.exit(); // Simply exit this process
});

// A simple function to send STOP command to our child process after 10 seconds
setTimeout(function() {
    py.stdin.write("STOP"); // Send the data to Child Process
    py.stdin.end();
},10000)
