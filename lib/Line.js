class Line {
  constructor (processorStream, initialState) {
    this._stream_ = processorStream;
    this._state_ = initialState || new Map();
    this._pushBackMap_ = new WeakMap();
    this._processor_ = () => {}; // noop

    /* Author's notes
      Well aware of the performance implications of proxies
      they offer a path to immutability that looks far more
      bright within and outside of the ECMA ecosystem */
    this._proxy_ = new Proxy(this._state_, this._proxyHandler);
  }

  get state() {
    return this._proxy_;
  }

  set state(state) {
    this._state_ = state;
  }

  pushBack(chunk) {
    this._pushBackMap_.set(this._processor_, chunk);
  }

  write(chunk) {
    this._stream_.write(chunk);
  }

  end(chunk) {
    this._stream_.end(chunk);
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
    return this;
  }
}

module.exports = Line;