class Interface {
  constructor() {
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
}

module.exports = Interface;