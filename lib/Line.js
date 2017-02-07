class Line {
  constructor (processorStream, initialState, size) {
    this._stream_ = processorStream;
    this._states_ = [];
    this._index_ = 0;
    this._pushBackMap_ = new WeakMap();
    this._processor_ = () => {}; // noop

    // Populate States
    for (let i = 0; i < size; i++) {
      /* Author's notes
        Well aware of the performance implications of proxies
        they offer a path to immutability that looks far more
        bright within and outside of the ECMA ecosystem */
      this._states_.push(new Proxy(initialState || new Map(), this._proxyHandler));
    }
  }

  get state() {
    console.log(this._states_, this._index_);
    return this._states_[this._index_];
  }

  set state(state) {
    this._states_[this._index_] = state;
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

  _setState(index) {
    this._index_ = index;
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