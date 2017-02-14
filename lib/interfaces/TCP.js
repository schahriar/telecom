const net = require('net');
const Interface = require('../Interface');

class TelecomTCPInterface extends Interface {
  constructor(port) {
    super();
    this.port = port || 8080;
    this.server = net.createServer((stream) => this.consume(stream));
    this.server.on('connection', () => this.debug("TelecomTCPInterface::CONNECTION ON PORT", this.port));
    this.server.on('error', (error) => this.throw(new Error(error), 'TelecomTCPInterface'));
    this.server.listen(port, () => this.debug("TelecomTCPInterface::TCP SOCKET ON PORT", this.port));
  }

  concat(...chunks) {
    return Buffer.concat(chunks);
  }
}

module.exports = TelecomTCPInterface;