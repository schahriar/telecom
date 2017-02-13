const vm = require('vm');
const fs = require('fs');
const net = require('net');
const cluster = require('cluster');
const EventEmitter = require('events').EventEmitter;
const numCPUs = require('os').cpus().length;
const Interface = require('./lib/Interface');
const PipeLine = require('./lib/Pipeline');

/**
 * Telecom Interface with a consumer pool for handling concurrent i/o streams
 * @typedef {Interface} Interface
 */

/**
 * Creates a new Telecom instance
 * @class Telecom
 */
class Telecom extends EventEmitter {
  constructor() {
    super();

    this.parallelized = 0;
    this.pindex = 0;
    this.pmap = new Map();

    if (cluster.isWorker) {
      console.log(`Worker ${cluster.worker.id} with pid:${process.pid} started`);

      // Worker -> Listen for execution notice from Master
      process.on('message', (packet) => {
        if (packet.type === 'process') {
          // Using setImmediate to defer for registration
          setImmediate(() => {
            if (this.pmap.has(packet.process)) this.pmap.get(packet.process)();
          });
        }
      });
    }
  }

  /**
   * @method pipeline
   * @param {Interface} interface
   * @returns {Pipeline}
   */
  pipeline(_interface) {
    return new PipeLine(_interface);
  }

  /**
   * Parallelize a function to n number of processes/cores
   * @method parallelize
   * @param {Number} totalForks
   * @param {function} handler - parallelized function
   */
  parallelize(totalForks, handler) {
    setImmediate(() => {
      if (cluster.isMaster) {
        //console.log(`Master ${process.pid} is running`);
        let i = 0,
          total = (totalForks || numCPUs),
          totalProcesses = total;

        // We already have enough cores running
        if (this.parallelized >= totalProcesses) return this._distribute(this.pindex, total);

        // Deduct already this.parallelized processes from total
        totalProcesses -= this.parallelized;

        for (i = 0; i < totalProcesses; i++) {
          const worker = cluster.fork();
          worker._telecom_meta = { plist: [] };
          //console.log("Fork #" + i + " created");
          this.parallelized++;
        }

        cluster.on('exit', (worker, code, signal) => {
          const plist = worker._telecom_meta.plist;
          const recovered_worker = cluster.fork();
          console.log(`Worker ${worker.id} died, restarting indices ${plist}`);
          for (let i = 0; i < plist.length; i++) {
            recovered_worker.send({ process: plist[i], type: 'process' });
          }
          recovered_worker._telecom_meta = { plist };
        });

        this._distribute(this.pindex, total);
      } else {
        this.pmap.set(this.pindex, handler);
      }
      this.pindex++;
    });
  }

  _distribute(pindex, total) {
    if (cluster.isMaster) {
      let count = 0;
      for (const id in cluster.workers) {
        if (count++ >= total) return;
        // Assign metadata including pindex to worker
        cluster.workers[id]._telecom_meta.plist.push(pindex);
        cluster.workers[id].send({ process: pindex, type: 'process' });
      }
    }
  }

  get isMaster() {
    return cluster.isMaster;
  }

  /**
   * @property {object} interfaces
   */
  get interfaces() {
    return Telecom.interfaces;
  }

  static get interfaces() {
    return {
      TCP: TelecomTCPInterface
    }
  }
}

class TelecomTCPInterface extends Interface {
  constructor(port) {
    super();
    this.port = port || 8080;
    this.server = net.createServer((stream) => this.consume(stream));
    this.server.on('connection', () => this.debug("TelecomTCPInterface::CONNECTION ON PORT", this.port));
    this.server.on('error', (error) => this.throw(new Error(error), 'TelecomTCPInterface'));
    this.server.listen(port, () => this.debug("TelecomTCPInterface::TCP SOCKET ON PORT", this.port));
  }
}

module.exports = Telecom;