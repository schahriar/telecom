const vm = require('vm');
const fs = require('fs');
const net = require('net');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Interface = require('./lib/Interface');
const PipeLine = require('./lib/PipeLine');
let parallelized = 0,
  pindex = 0,
  pmap = new Map();

// Worker -> Listen for execution notice from Master
if (cluster.isWorker) {
  console.log(`Worker ${cluster.worker.id} with pid:${process.pid} started`);
  process.on('message', (packet) => {
    if (packet.type === 'process') {
      // Using setImmediate to defer for registration
      setImmediate(() => {
        if (pmap.has(packet.process)) pmap.get(packet.process)();
      });
    }
  });
}

class Telecom {
  static pipeline(_interface) {
    return new PipeLine(_interface);
  }

  static parallelize(totalForks, handler) {
    setImmediate(() => {
      if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
        let i = 0,
            total = (totalForks || numCPUs),
            totalProcesses = total;

        // We already have enough cores running
        if (parallelized >= totalProcesses) return this._distribute(pindex, total);

        // Deduct already parallelized processes from total
        totalProcesses -= parallelized;

        for (i = 0; i < totalProcesses; i++) {
          const worker = cluster.fork();
          console.log("Fork #" + i + " created");
          parallelized++;
        }

        cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died`);
        });

        this._distribute(pindex, total);
      } else {
        pmap.set(pindex, handler);
      }
      pindex++;
    });
  }

  static _distribute(pindex, total) {
    if (cluster.isMaster) {
      let count = 0;
      for (const id in cluster.workers) {
        if (count++ >= total) return;
        cluster.workers[id].send({ process: pindex, type: 'process' });
      }
    }
  }

  static get isMaster() {
    return cluster.isMaster;
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
    this.server = net.createServer((stream) => this.onStream(stream));
    this.server.on('connection', () => console.log("TelecomTCPInterface::CONNECTION ON PORT", this.port));
    this.server.on('error', (e) => console.log("TelecomTCPInterface::SOCKET ERROR", e))
    this.server.listen(port, () => console.log("TelecomTCPInterface::TCP SOCKET ON PORT", this.port));
  }

  onStream(stream) {
    for (let consumer of this.pool) {
      consumer(stream);
    }
  }
}

module.exports = Telecom;