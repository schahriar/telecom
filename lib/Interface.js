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

module.exports = Interface;