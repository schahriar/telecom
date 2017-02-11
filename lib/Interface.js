const EventEmitter = require('events').EventEmitter;

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

  consume(stream) {
    for (let consumer of this.pool) {
      consumer(stream);
    }
  }

  throw(...args) {
    this.emit('error', ...args);
  }

  debug(...args) {
    this.emit('debug', ...args);
  }
}

module.exports = Interface;