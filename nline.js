const vm = require('vm');
const fs = require('fs');
const net = require('net');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

class Interface {
  constructor() {
    this.pool = new Set();
  }

  addConsumer(consumer) {
    this.pool.add(consumer);
  }

  removeConsumer(consumer) {
    this.pool.remove(consumer);
  }
}

class NLineTCPInterface extends Interface {
  constructor(port) {
    super();
    this.port = port || 8080;
    this.server = net.createServer((stream) => this.onStream(stream));
    this.server.on('connection', () => console.log("NLineTCPInterface::CONNECTION ON PORT", this.port));
    this.server.on('error', (e) => console.log("NLineTCPInterface::SOCKET ERROR", e))
    this.server.listen(port, () => console.log("NLineTCPInterface::TCP SOCKET ON PORT", this.port));
  }

  onStream(stream) {
    for (let consumer of this.pool) {
      consumer(stream);
    }
  }
}

class PipeLine {
  constructor(_interface_) {
    this._interface = _interface_;
    this._pipeline = [];
    this._interface.addConsumer((stream) => this._internalRouter(stream));
  }

  pipe(processor) {
    this._pipeline.push(processor);
    return this;
  }

  _internalRouter(stream) {
    let pipeline = this._pipeline.slice(0);

    const feed = (chunk, processor) => {
      if (!processor) {
        line._setProcessor(() => {}); /** @todo: set this to a shared noop variable or handle in Line class */
        if (!pipeline.length) return;
        else processor = pipeline.shift();
      }

      line._setProcessor(processor);
      if (line._hasPushedBackChunks()) {
        processor(Buffer.concat([line._getPushedBackChunks(), chunk]), line, (chunk) => feed(chunk, pipeline.shift()));
      } else {
        processor(chunk, line, (chunk) => feed(chunk, pipeline.shift()));
      }
    };

    let line = new Line(stream);
    stream.on('data', feed);
    //stream.on('end', feed);
    stream.on('error', (error) => console.log(error));
  }
}

class Line {
  constructor (processorStream, initialState) {
    this._stream_ = processorStream;
    this._state_ = initialState || new Map();
    this._pushBackMap_ = new WeakMap();
    this._processor_ = () => {}; // noop

    /* Author's notes
      Well aware of the performance implications of proxies
      they offer a path to immutability that looks far more
      bright within and outside of the ECMA ecosystem */
    this._proxy_ = new Proxy(this._state_, this._proxyHandler);
  }

  get state() {
    return this._proxy_;
  }

  set state(state) {
    this._state_ = state;
  }

  pushBack(chunk) {
    this._pushBackMap_.set(this._processor_, chunk);
  }

  write(chunk) {
    this._stream_.write(chunk);
  }

  end(chunk) {
    this._stream_.end(chunk);
  }

  get _proxyHandler() {
    return {
      get: (state, prop) => state.get(prop),
      has: (state, prop) => state.has(prop),
      set: (state, prop, value) => state.set(prop, value) 
    }
  }

  _hasPushedBackChunks() {
    return this._pushBackMap_.has(this._processor_);
  }

  _getPushedBackChunks() {
    return this._pushBackMap_.get(this._processor_);
  }

  _setProcessor(processor) {
    this._processor_ = processor;
    return this;
  }
}

const slang = {
  Buffer: Buffer,
  pipeline: (_interface_) => {
    return new PipeLine(_interface_);
  },
  Tcp: NLineTCPInterface,
  log: console.log.bind(console, "..")
};

const script = new vm.Script(fs.readFileSync('./' + process.argv[2] + '.js'));
const context = new vm.createContext(slang);

if (cluster.isMaster) {
  console.log(`Master ${process.pid} is running`);
  let i = 0;

  for (i = 0; i < numCPUs; i++) {
    cluster.fork();
    console.log("Fork #" + i + " created");
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  script.runInContext(context);
  console.log(`Worker ${process.pid} started`);
}