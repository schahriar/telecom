const EventEmitter = require('events').EventEmitter;

let state = {
  workers: {},
  totalForks: 0,
  isMaster: true,
  events: new EventEmitter()
};

mockInterfaces.cluster = {
  state
};

module.exports = {
  fork: () => {
    state.totalForks++;
    const id = state.totalForks.toString();
    
    state.workers[id] = {
      id,
      send: (...args) => { state.events.emit('send', ...args); }
    };

    return state.workers[id];
  },

  on: () => {},

  isMaster: true,
  workers: state.workers
};