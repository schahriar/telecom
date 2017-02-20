const Line = require('./Line');
const Router = require('./Router');
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
    const line = new Line();
    const router = new Router(line, this._interface, () => this[Symbol.iterator]());

    stream.on('error', (error) => this.emit(interfaceErrorEventName, error));
    router.on('next', (...args) => this.emit('next', ...args));
    line.on('error', (...args) => this.emit('error', ...args));

    stream.pipe(router);
    line.pipe(stream);
  }
}

module.exports = PipeLine;