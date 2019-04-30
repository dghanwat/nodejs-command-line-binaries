# Executing command line binaries in Node.js

In today's lesson, we will learn about  `child_process` module of Node.js, which allows you to execute external binaries in your environment. In other words, your Node.js app can run and communicate with other applications on the computer that it is hosted on. 

## Use case

Why would we need it?

- Node.js is designed for efficient I/O processes, but sometimes applications require more CPU intensive work, which may block the main event. So, you may want to offshoot the CPU intensive work to another process.
- Node.js is one of the most adopted web development technologies but it lacks support (so far) for machine learning, deep learning and artificial intelligence libraries. Luckily, technologies like Python supports all these and many more other features. So, you may want to leverage these features in your Node.js app.
- You want to do a batch processing with regular checkpoint and based on the checkpoint you wish to do some status reporting from Node.js app 

Above are only a few examples where you would want your Node.js application to communicate with external binaries.

## Introduction

Node.js allows us to execute a system binary within a child process and listen in on its input/output. This includes being able to pass arguments to the command, and even pipe the results of one command to another.

Most commonly used functions to perform this are:

- `exec`
- `spawn`



## `exec` 

  `child_process.exec(command[, options][, callback])`

#### Usage

- Asynchronously retrieve a result of external binary into your Node.js application

  

Let's say I want to find what version of `git` is installed on my machine. I would use the command 

```
git version
```

and this would give an output like below (depending on what you have installed on your machine)

```
git version 2.20.1.windows.1
```

or may be command like

```
ls -ltr
```

will return the list of files on the PC.

With the Node.js execute function we can actually execute these external commands from our Node.js
app. Let's go ahead and try it out

```javascript
// Extract the exec function from the child_process module
const exec = require("child_process").exec;

/**
 * child_process.exec(command[, options][, callback])
 * command - Command to execute. You can have space separated arguments if the command accepts any args
 * options - You can give options like Environment variables required for the child process
 * callback - function which will be called with the output when the process terminates.
 *           error - If any errors are thrown during the process exception
 *           stdout - Any data that gets returned by the process
 *           stderr - Any error that is logged by the process
 */
exec("git version",function(err,stdout,stderr) {
    // If there is an error executing `git version` like git not found, then
    // throw it back
    if(err) {
        throw err;
    }
	// Log the output received from the child process
    console.log(stdout);
    console.log("Git version execution finished");
    
});
```

when you execute the above script using `node exec.js` you will get the following output

```
git version 2.20.1.windows.1
Git version finished
```

So, the execute command is a nice tool that allows us to execute external processes found in our environment, but there is more



## `spawn` 

`child_process.spawn (command[, argsArray][, optionsObject])`

`exec` command is useful when all you want to is to get the final result from your command and not about accessing the data from a child process output streams as they come. To do this we use the `spawn` function

Let's say you have a very long running process, which keeps on giving you output about the progress. Below is our python script which simulates long running process. I have chosen Python script to demonstrate that our child process can be any executable (Java, Scala, Windows Binary etc)

So here is our python script

```python
import sys, json
from threading import Timer

#Simulator for a Long running process
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

#Read commands from Std input    
def read_in():
    command = sys.stdin.readlines()
    return command[0]

def main():
    a = LongRunningProcess()
    a.setInterVal(a.work,1)
    command = read_in()
    #If we receive the input as stop, we stop the process and exit
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

So, this is an example of large bit of data and it also is a long-running process so we can't just use `exec` here. *(More details on difference later)*

We can invoke `long_running_process.py` from our Node.js `spawn.js` file

```javascript
// Extract the spawn function from the child_process module
const spawn = require('child_process').spawn;

/**
 * child_process.spawn(command[,args][, options])
 * command - Command to execute. for example node, python etc
 * args - List of String Arguments. Generally first is the name of binary file that would run in the terminal, followed by any arguments that the program accepts
 * options - You can give options like Environment variables required for child process
 */
const  py = spawn('python', ['long_running_process.py']);

// Listen for data event, in other works when ever there is a 
// data event this call back function will be fired
py.stdout.on('data', function(data){
    console.log(`STDOUT: ${data.toString()}`)
});

// Listen for event when streaming ends
py.stdout.on('end', function(data){
    // Do some thing when streaming from child process ends
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

We were able to spawn a python script from our Node.js application, collect streaming data from child process and also can communicate with the processes via standard input and standard output

## Comparison between `exec` and `spawn`  

So here we have seen two functions `spawn` and `exec`, using which we can start a child process to execute binaries on the system. You may wonder why are there two functions to do the same thing, and which one you should use when.

To understand that lets look at what do these functions return; `spawn` returns a stream and `exec` returns a buffer

`spawn`  starts sending data back from the child process in a stream as soon as the child process starts executing. So you should use `spawn` when your process returns a large amount of data like - image / video processing, reading binary data etc. Basically, anything where you think streaming can be best option

`exec` although is asynchronous, it waits for the child process to end and only then tries to return all the buffered data at once. So you should use `exec` when you want the child process to return simple outputs like status messages etc



## Conclusion

Using `child_process` module, Node.js allows us to run a system binary within a child process and listen in on its input/output. Its completely asynchronous, event driven communication and we have two variations for achieving of it. 

`spawn` when you want to work on streaming process

`exec` when you are interested in only the final result of the process.