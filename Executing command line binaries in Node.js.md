# Executing command line binaries in Node.js

In today's lesson we will learn about  `child_process` module of Node.js which allows you to execute processes in your environment. In other words your Node.js app can run and communicate with other applications on the computer that it is hosted on. 

## Use case

- Node is designed for efficient I/O processes, but sometimes applications require more CPU intensive work, which may block the main event. So you may want to off shoot the CPU intensive work to another process.
- Node.js is one of the most adopted web development technologies but it lacks support (so far) for machine learning, deep learning and artificial intelligence libraries. Luckily, technologies like Python supports all these and many more other features. So you may want to leverage these features in your Node.js app.
- You want to do a batch processing with regular checkpoint and based on the checkpoint you wish to do some status reporting from Node.js app 

Above are only few examples where you would want you Node.js application to communicate with external binaries.

## Introduction

Node.js allows us to execute a system binary within a child process and listen in on its input/output. This includes being able to pass arguments to the command, and even pipe the results of one command to another.

We can perform this in three different ways:

- `exec`
- `spawn`
- `execFile`



## `exec` 

  

```
child_process.exec(command[, options][, callback])
```

Lets say I want to find what version of git is installed on my machine. I would use the command 

```
git version
```

and this would give an output like below (depending on what you have installed on your machine)

```
git version 2.20.1.windows.1
```

or command like 

```
ls -ltr
```

will return the list of files on the PC.

With the Node.js execute function we can actually execute these external commands from our Node.js
app. Let's go ahead and try it out

```javascript
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
```

So the execute command is a nice tool that allows us to execute external processes found in our environment



## `spwan` 

```
child_process.spawn (command[, argsArray][, optionsObject])
```

`exec` command is useful for when all you want to is to get final result from your command and not about accessing the data from a child’s `stdio` streams as they come. To do this we use the `spawn` function

Let's  say you have a very long running process, which keeps on giving you output about the progress. Below is a our python script which simulates long running process

So here is our python script

```python
import sys, json
from threading import Timer

class LongRunningProcess:
    def __init__(self):
        self.sure = True

    def work(self,func,san):
        sys.stdout.write("Working Hard..\n")
        sys.stdout.flush()
        self.setInterVal(func, san)

    def setInterVal(self,func, san):
        def func_Calistir():
            func(func,san)
            
        self.t = Timer(san, func_Calistir)
        self.t.start()
        return self.t

    def stop(self):
        self.t.cancel()

    
def read_in():
    command = sys.stdin.readlines()
    return command[0]

def main():
    a = LongRunningProcess()
    a.setInterVal(a.work,1)
    command = read_in()
    if(command == "STOP"):
        a.stop()
        
#start process
if __name__ == '__main__':
    main()
```

  If you run this script using command `python long_running_process.py` you should get output like below

```bash
Working Hard..
Working Hard..
Working Hard..
Working Hard..
Working Hard..
Working Hard..
Working Hard..

```

So this is a large bit of data and it also is a long-running process so we can't just use `exec` here. *(More details on difference later*

So here is our `spawn.js` Node file

```javascript
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

```

Running the above script using command `node spawn.js` you will see the below output

```bash
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
STDOUT: Working Hard..
End of process
```

So we were able to spawn a python script from our Node.js application and you can communicate with those processes via standard input and standard output

## `execFile`

`todo`

## Compassion between `exec` and `spawn`  

So here we have seen two functions two functions `spawn` and `exec`, using which we can start a child process to execute other programs on the system. You  may wonder why there are two functions to do the same thing, and which one you should use when.

The most significant difference between `child_process.spawn` and `child_process.exec` is in what they return - spawn returns a stream and exec returns a buffer

`spawn`  starts sending back data from the child process in a stream as soon as the child process starts executing. So you should use `spawn` when your process return a large amount of data like - image processing, reading binary data. Basically anything where you think streaming can be used

`exec` although is asynchronous, it waits for the child process to end and tries to return all the buffered data at once. If the buffer size of `exec` is not set big enough, it fails with a "maxBuffer exceeded" error. So you should use `exec` when you want the child process to return simple outputs like status messages etc



## Conclusion

Using `child_process` module, Node.js allows us to run a system binary within a child process and listen in on its input/output.

Use `spawn` when you want to work on streaming applications

Use `exec` when you want are interested in only the final result of the process.