const EventEmitter = require('events').EventEmitter;
let PassThrough = require('stream').PassThrough;
let pipeline, interface;
let lastMessage = "";
let stream = new PassThrough();

describe("Pipeline Unit Tests", function () {
  it('should create a new Pipeline', function () {
    intf = new Interface();
    pipeline = new Pipeline(intf);

    expect(pipeline).to.have.property("pipe");
    expect(pipeline).to.be.an.instanceof(EventEmitter);
  });

  it('should pipe to a processor', function (done) {
    pipeline.pipe((chunk, line, next) => {
      lastMessage = chunk;
      next(chunk);
    });

    intf.consume(stream);

    stream.write('testChunk');
    setImmediate(() => {
      expect(lastMessage.toString('utf8')).to.be.equal('testChunk');
      done();
    });
  });

  it.skip('should catch errors');
  it.skip('should trigger next event');
});