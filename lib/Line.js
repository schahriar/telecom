const EventEmitter = require('events').EventEmitter;

class Line extends EventEmitter {
  constructor (processorStream, defaultState) {
    super();

    this.open = true;
    this._stream_ = processorStream;
    this._states_ = new Map();
    this._error_ = false;
    this._pushBackMap_ = new WeakMap();
    this._processor_ = () => {}; // noop

    if (defaultState) {
      defaultState = Object.keys(defaultState).map((key) => [key, defaultState[key]]);
    }

    this._defaultState_ = defaultState;
  }

  get state() {
    return this._states_.get(this._processor_);
  }

  set state(state) {
    this._states_.set(this._processor_, state);
  }

  pushBack(chunk) {
    this._pushBackMap_.set(this._processor_, chunk);
  }

  write(chunk) {
    this._stream_.write(chunk);
  }

  end(chunk) {
    this._stream_.end(chunk);
    this.open = false;
  }

  throw(error, ...args) {
    this._error_ = error;
    this.emit('error', error, this, ...args);
  }

  catch(callback) {
    this.on('error', (...args) => callback(...args));
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
    if (!this._states_.has(processor)) {
      /* Author's notes
        Well aware of the performance implications of proxies
        they offer a path to immutability that looks far more
        bright within and outside of the ECMA ecosystem */
      const proxy = new Proxy(new Map(this._defaultState_), this._proxyHandler);
      this._states_.set(processor, proxy);
    }

    return this;
  }
}

module.exports = Line;