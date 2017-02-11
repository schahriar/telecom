const Line = require('./Line');
const EventEmitter = require('events').EventEmitter;

class PipeLine extends EventEmitter {
  constructor(_interface_) {
    super();

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
    const size = pipeline.length;

    const feed = (chunk, processor) => {
      if (!processor) {
        line._setProcessor(() => {}); /** @todo: set this to a shared noop variable or handle in Line class */
        if (!pipeline.length) return;
        else processor = pipeline.shift();
      }

      line._setProcessor(processor);

      this.emit('next', line, processor);

      // Run processor and handle sync errors
      try {
        if (line._hasPushedBackChunks()) {
          processor(Buffer.concat([line._getPushedBackChunks(), chunk]), line, (chunk) => feed(chunk, pipeline.shift()));
        } else {
          processor(chunk, line, (chunk) => feed(chunk, pipeline.shift()));
        }
      } catch (error) {
        line.throw(error);
      }
    };

    let line = new Line(stream);
    line.catch((...args) => this.emit('error', ...args));
    stream.on('data', feed);
    //stream.on('end', feed);
    stream.on('error', (error) => this.emit('stream:error', error));
  }
}

module.exports = PipeLine;