const EventEmitter = require('events').EventEmitter;
const Readable = require('stream').Readable;
const kIBufferList = Symbol('bufferList');
const kSource = Symbol('source');
const kStates = Symbol('states');
const kOpen = Symbol('open');

/**
 * @class Line
 */
class Line extends Readable {
  constructor (defaultState) {
    super();

    this.finished = false;
    // Internal buffer as an internative to Readable#pause for recovery purposes
    this[kIBufferList] = [];
    this[kStates] = new Map();
    this.onHold = false;
    this._error_ = false;
    this._pushBackMap_ = new WeakMap();
    this._processor_ = () => {}; // noop

    this.on('finish', () => this.finished = true);

    if (defaultState) {
      defaultState = Object.keys(defaultState).map((key) => [key, defaultState[key]]);
    }

    this._defaultState_ = defaultState;
  }

  /**
   * Line state scoped to current processor
   * @property {Object} state
   */
  get state() {
    return this[kStates].get(this._processor_);
  }

  set state(state) {
    this[kStates].set(this._processor_, state);
  }

  /**
   * JS Symbol passed when a stream has opened
   * @returns {Symbol} kOpen
   */
  get OPEN() {
    return kOpen;
  }

  /**
   * Push a chunk of any type back to the stream
   * effectively buffering and concatenating to the
   * next chunk
   * @method unshift
   * @param {*} chunk
   */
  unshift(chunk) {
    this._pushBackMap_.set(this._processor_, chunk);
  }

  /**
   * Write a chunk of any type to the stream
   * @method write
   * @param {*} chunk
   */
  // Note that this method acts as a read role
  // in the stream piping back to upstream
  write(chunk) {
    if (this.finished) return false;
    this[kIBufferList].push(chunk);
  }

  /**
   * End the stream with an optional chunk
   * @method end
   * @param {*} [chunk]
   */
  end(chunk) {
    if (chunk) this.write(chunk);
    this.write(null);
  }

  /**
   * Throw an async error within the line
   * @method throw
   * @param {Error} error
   * @param {function} recoveryMethod - A function passed if a safe recovery attempt is possible
   */
  throw(error, recoveryMethod) {
    this._error_ = error;
    this.emit('error', error, recoveryMethod, this);
  }

  /**
   * A wrapper around line.on('error')
   * @method catch
   * @param {function} callback
   */
  catch(callback) {
    this.on('error', (...args) => callback(...args));
  }

  /**
   * Reset line's internal buffer effectively stopping last queued writes
   * @method reset
   */
  reset() {
    this[kIBufferList] = [];
  }

  /**
   * Hold all Line#write calls in an internal buffer
   * without sending them to their destination stream
   * @method hold
   */
  hold() {
    this.onHold = true;
  }

  /**
   * Release held writes back to the stream
   * @method release
   */
  release() {
    this.onHold = true;
  }

  _read(size) {
    if ((!this[kIBufferList].length) || (this._onHold_)) return setImmediate(() => this._read(size));
    // Push chunk
    this.push(this[kIBufferList].shift());
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

    // Create initial state if unavailable
    if (!this[kStates].has(processor)) {
      /* Author's notes
        Well aware of the performance implications of proxies
        they offer a path to immutability that looks far more
        bright within and outside of the ECMA ecosystem */
      const proxy = new Proxy(new Map(this._defaultState_), this._proxyHandler);
      this[kStates].set(processor, proxy);
    }

    return this;
  }

  _call(chunk, next) {
    this._processor_(chunk, this, next);
  }
}

module.exports = Line;