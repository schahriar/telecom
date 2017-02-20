# Telecom
A reactive framework for bi-directional concurrent streams.
-------
[![Build Status](https://travis-ci.org/schahriar/telecom.svg?branch=master)](https://travis-ci.org/schahriar/telecom)

<!--VERSION_START-->
v0.3.0 `----- .-.-.- ...-- .-.-.- -----`
<!--VERSION_END-->

-------

Telecom follows the [reactive manifesto](http://www.reactivemanifesto.org/) in its simplest form by parallelizing and isolating streamlined applications. It allows for creating bi-directional streams (such as TCP, HTTP, or even DOM if you wish) and exposes an isolated state-machine per stream/line.

Unlike RX, Telecom takes a much more minimalistic approach while providing for a different use-case for reactive programming.

-------

## Getting Started
Install Telecom from NPM
```
npm install telecom --save
```

Start by creating a simple TCP echo server on port 8000 and parallelizing the line (multiple streams) on 4 processes:

```javascript
const Telecom = require('telecom')
const telecom = new Telecom();

// Parallelize our application on 4 cores
telecom.parallelize(4, () => {
  // Simple echo server on port 8000
  telecom.pipeline(new Telecom.interfaces.TCP(8000))
       .pipe((chunk, line, next) => {
          if (chunk === line.OPEN) return; // Ignore opened constant
          if (chunk === null) line.end();
          else line.write(chunk);
          
          next(chunk);
       });
});
```

Let's digest that.

### Parallelize

We first start by requiring Telecom and calling `telecom.parallelize`, this method takes an integer as its first argument and a function as its second argument. The passed function then is called whenever the application has been parallelized on the required number of cores.

**You can parallelize a function to any desired number of desired processes and you can parallelize multiple times within an application, distributing any number of functions to n number of processes**

For example you can parallelize two functions on different number of processes **(they share the same total number of processes in the pool)** through the following:

```javascript
const p1 = 2;
const p2 = 4;

telecom.parallelize(p1, () => {
 // Anything within this function is parallelized on 2 processes
});

telecom.parallelize(p2, () => {
 // Anything within this function is parallelized on 4 processes
});

// Total number of processes started is the max between p1 and p2 which in this case is 4
```

### Pipeline
We then continued by creating a *pipeline* within our *parallelized* function using the `telecom.pipeline` method. This simple method defines an *input stream* for your pipeline that then you can pipe functions to, listen for errors or generally observe. The method accepts an `Interface` as the first parameter and an initial state for every Line as the second (we'll go through states in a few paragraphs).

**An Interface maintains a pool of streams (e.g. 1000 active TCP connections), these are then sent through the pipeline as isolated and concurrent streams regardless of where they reside.**

```javascript
// Create a new Pipeline with stream input from connections on port 25 with an initial state of { protocol: 'SMTP' }
telecom.pipeline(new telecom.interfaces.TCP(25), { protocol: 'SMTP' })
```

A pipeline will have `.pipe` and `.on` methods for piping and observing behaviors within the pipeline. Note that a Pipeline is not event-driven internally, only externally you can listen and interact with these events.

### Pipe & Stream-processing
Stream-processing can be a simple and powerful concept provided that you have the right means and concepts. Telecom offers a `Line` object to address majority of issues with a Duplex (bi-directional) stream and maintaining transparent state within isolated streams.

Let's explore a little in our stream-processing and the issues we can face before jumping into Lines.

In the previous example we created a stream-processing function that took input from TCP port 8000 and echoed back whatever it received:

```javascript
// Simple echo server on port 8000
telecom.pipeline(new Telecom.interfaces.TCP(8000))
    .pipe((chunk, line, next) => {
      if (chunk === line.OPEN) return; // Ignore opened constant
      if (chunk === null) line.end();
      else line.write(chunk);

      next(chunk);
    });
```

Our stream-processing function within the pipe always receives the input as the first argument **and a Symbol constant equal to `line.OPEN` when a stream has opened.**

**An Input within a stream can be of any type but only a single input/output is allowed within the stream. The type can be transformed within the stream through processing. For example an HTTP processor can transform a Byte input into a request object passed down within the stream**

The next argument within the function is our `Line`, a Line allows for bi-directional communication and holds the only source of state for this opened stream, we can interact with it using a couple of simple methods. In our example we used `line.write` and `line.end`, **both methods accept a single output of any type** which often in the case of a TCP/HTTP stream is a Buffer. In the case of `line.end` the line sends the last response or no response at all and ends that particular line.

The final argument in the pipe method is the `next` function, this allows you to control the flow within the line.

- By ignoring the next call you stop the flow until another input is received
- By passing the same input to the next call you'll match your output with your input (your processing will effectively be PassThrough)
- By passing a transformed or modified version of the input to the output you'll transform the stream

<!-- TODO: Add visuals to assit next call -->

Let's say we want to have a logger wherby the length of the input is always logged to the console within our stream before we echo back the input much like our previous example. We can create a PassThrough processor by simply calling `next(chunk)` at the end of our function.

```javascript
.pipe((chunk, line, next) => {
  console.log("SIZE OF CHUNK", chunk.length);
  next(chunk);
})
```

Let's follow that by adding a simple processor that ignores any input that is larger than 1024 bytes, we can easily achieve this by only calling `next(chunk)` if the input is less than or equal to 1024 bytes.

```javascript
.pipe((chunk, line, next) => {
  if (chunk.length <= 1024) next(chunk);
  else console.log("CHUNK IGNORED");
})
```

Now let's put that back together into a working pipeline that:

- Logs the length of every input
- Ignores any input larger than ~1kb
- Echoes back any valid input
- If the input is finished (null) it will end the line

```javascript
// Simple echo server on port 8000
telecom.pipeline(new Telecom.interfaces.TCP(8000))
      .pipe((chunk, line, next) => {
        if (chunk === line.OPEN) return; // Ignore opened constant
        console.log("SIZE OF CHUNK", chunk.length);
        next();
      })
      .pipe((chunk, line, next) => {
        if (chunk.length <= 1024) next(chunk);
        else console.log("CHUNK IGNORED");
      })
      .pipe((chunk, line, next) => {
        if (chunk === null) line.end();
        else line.write(chunk);
      });
```

-------

## Lines and State
Inspired by reactive manifesto, each `Line` owns a state-machine with individual state objects assigned to every processor. States are not share-able across `Lines` or `Processors` as reactive programming is message-driven and for good reasons.

Let's assume we need to count the number of times a stream has input sent to it, by design there are no communication layers or any indication of the current line you may be using but you can make use of simple state objects isolated to a function in order to processes with a context, this state is available to you as `line.state`, here is the counter example using `line.state`:

```javascript
.pipe((chunk, line, next) => {
  // Define the counter
  if (!line.state.counter) line.state.counter = 0;

  // Add to our counter
  line.state.counter++;

  // End line if the counter has reached 3
  if (line.state.counter >= 3) return line.end("Received 3 inputs");

  next(chunk);
})
```

States are isolated per processor function, therefore the following behavior is expected:

```javascript
.pipe((chunk, line, next) => {
  line.state.counter = 4;

  next(chunk);
}).pipe((chunk, line, next) => {
  console.log(line.state.counter); // Output: undefined
})
```

**Note that states are isolated per processor function and a state MUST always be serializable. A failure within a processor or part of the application must remain recovarable by keeping the state small and serializable.**

### Buffering chunks to be reprocessed

Byte buffer chunks can be pushed back to the stream (buffered) using the `line.pushBack` method. If a processor is not ready to process a specific chunk or parts of the chunk it can pushBack that buffer to be added to the upcoming chunk in the stream.

```javascript
.pipe((chunk, line, next) => {
  if (!line.state.headerEnd) {
    if (chunk.indexOf('\n') === -1) return line.pushBack(chunk);
    // process ...
  } else {
    next(chunk);
  }
});
```

## Pipeline error handling
By default, Lines are capable of handling both synchronous and asynchronous error handling. These error will be caught and emitted under the `error` event on the `Pipeline`. You can use `line.throw(...)` to throw an async error.

```javascript
.pipe((chunk, line, next) => {
  if (line.state.badHeader) throw new Error("Received Bad Headers");
  
  next(chunk);
}).pipe(chunk, line) => {
  db.request(..., (error, results) => {
    if (error) return line.throw(error);
    // ...
  });
}).on('error', (error, line) => {
  console.error(error);
  line.end("Internal Server Error");
});
```

You can equally log debug events within the interface using:

```javascript
.on('debug', (...args) => {
  console.log(...args);
});
```

## License
[MIT license](https://raw.githubusercontent.com/schahriar/telecom/master/LICENSE)