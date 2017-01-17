const Line = require('./Line');

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

module.exports = PipeLine;