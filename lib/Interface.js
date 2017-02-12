const EventEmitter = require('events').EventEmitter;

/**
 * Interface extensible Class
 * @interface Interface
 */
class Interface extends EventEmitter {
  constructor() {
    super();

    this.pool = new Set();
  }

  addConsumer(consumer) {
    this.pool.add(consumer);
  }

  hasConsumer(consumer) {
    return this.pool.has(consumer);
  }

  removeConsumer(consumer) {
    this.pool.delete(consumer);
  }

  /**
   * Add a new stream to be consumed by associated pipeline
   * @method consume
   * @param {DuplexStream} stream
   */
  consume(stream) {
    for (let consumer of this.pool) {
      consumer(stream);
    }
  }

  /**
   * Throw a new error within the pipeline (accessible under interface:error listener on the pipeline)
   * @method throw
   * @param {...args} - error arguments
   */
  throw(...args) {
    this.emit('error', ...args);
  }

  /**
   * Log a debug event to pipeline
   * @method debug
   * @param {...args} - debug arguments
   */
  debug(...args) {
    this.emit('debug', ...args);
  }
}

module.exports = Interface;