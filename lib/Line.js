const EventEmitter = require('events').EventEmitter;
const Readable = require('stream').Readable;
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
    this[kStates] = new Map();
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
    this.push(chunk);
  }

  /**
   * End the stream with an optional chunk
   * @method end
   * @param {*} [chunk]
   */
  end(chunk) {
    if (chunk) this.push(chunk);
    this.push(null);
  }

  /**
   * Throw an async error within the line
   * @method throw
   * @param {Error} error
   * @param {...args} args
   */
  throw(error, ...args) {
    this._error_ = error;
    this.emit('error', error, this, ...args);
  }

  catch(callback) {
    this.on('error', (...args) => callback(...args));
  }

  _read(size) { }

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