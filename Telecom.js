const vm = require('vm');
const fs = require('fs');
const net = require('net');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const Interface = require('./lib/Interface');
const PipeLine = require('./lib/PipeLine');
let isParallel = false;

class Telecom {
  static pipeline(_interface) {
    return new PipeLine(_interface);
  }

  static parallelize(totalForks, handler) {
    isParallel = true;
    setTimeout(() => {
      if (cluster.isMaster) {
        console.log(`Master ${process.pid} is running`);
        let i = 0;

        for (i = 0; i < (totalForks || numCPUs); i++) {
          cluster.fork();
          console.log("Fork #" + i + " created");
        }

        cluster.on('exit', (worker, code, signal) => {
          console.log(`Worker ${worker.process.pid} died`);
        });
      } else {
        handler();
        console.log(`Worker ${process.pid} started`);
      }
    });
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