const Writable = require('stream').Writable;

class Router extends Writable {
  constructor(line, _interface, iterator) {
    super();
    this.line = line;
    this.interface = _interface;
    this.iterator = iterator;
    this.on('end', () => this.feed(null));
    // Start pipeline with Line#OPEN constant
    this.feed(this.line.OPEN);
  }

  _write(chunk, encoding, next) {
    this.feed(chunk);
    next();
  }

  feed(chunk, iterator) {
    if (!iterator) iterator = this.iterator();

    const next = iterator.next();
    if (next.done) return;

    this.line._setProcessor(next.value);

    this.emit('next', this.line);

    // Run processor and handle sync errors
    try {
      if (this.line._hasPushedBackChunks() && chunk) {
        this.line._call(this.interface.concat(this.line._getPushedBackChunks(), chunk), (chunk) => this.feed(chunk, iterator));
      } else {
        this.line._call(chunk, (chunk) => this.feed(chunk, iterator));
      }
    } catch (error) {
      this.line.throw(error);
    }
  }
};

module.exports = Router;