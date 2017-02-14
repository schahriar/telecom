const Line = require('./Line');
const EventEmitter = require('events').EventEmitter;
const interfaceErrorEventName = 'interface:error';

/**
 * @class Pipeline
 * @fires error
 * @fires interface:error
 * @fires debug
 */
class PipeLine extends EventEmitter {
  constructor(_interface_) {
    super();

    this._interface = _interface_;
    this._pipeline = [];
    this._interface.addConsumer((stream) => this._internalRouter(stream));

    this._interface.on('error', (...args) => this.emit(interfaceErrorEventName, ...args));
    this._interface.on('debug', (...args) => this.emit('debug', ...args));
  }

  /**
   * Adds new stream processor to pipeline
   * @method pipe
   */
  pipe(processor) {
    this._pipeline.push(processor);
    return this;
  }

  [Symbol.iterator]() {
    let index = -1;

    return {
      next: () => ({ value: this._pipeline[++index], done: !(index in this._pipeline) })
    };
  }

  _internalRouter(stream) {
    let pipeline = this._pipeline.slice(0);

    const feedLoop = (chunk, iterator) => {
      let processor;
      if (!iterator) {
        iterator = this[Symbol.iterator]();
      }

      const next = iterator.next();
      if (next.done) return;
      else processor = next.value;

      line._setProcessor(processor);

      this.emit('next', line, processor);

      // Run processor and handle sync errors
      try {
        if (line._hasPushedBackChunks() && chunk) {
          processor(this._interface.concat(line._getPushedBackChunks(), chunk), line, (chunk) => feedLoop(chunk, iterator));
        } else {
          processor(chunk, line, (chunk) => feedLoop(chunk, iterator));
        }
      } catch (error) {
        line.throw(error);
      }
    };

    let line = new Line(stream);
    line.catch((...args) => this.emit('error', ...args));
    stream.on('data', (...args) => feedLoop(...args));
    stream.on('end', () => {
      line.end();
      feedLoop(null);
    });
    stream.on('error', (error) => this.emit(interfaceErrorEventName, error));
  }
}

module.exports = PipeLine;