const EventEmitter = require('events').EventEmitter;
let PassThrough = require('stream').PassThrough;
let pipeline, interface;
let lastMessage = "";

describe("Pipeline Unit Tests", function () {
  it('should create a new Pipeline', function () {
    intf = new Interface();
    pipeline = new Pipeline(intf);

    expect(pipeline).to.have.property("pipe");
    expect(pipeline).to.be.an.instanceof(EventEmitter);
  });

  it('should pipe to a processor', function (done) {
    const stream = new PassThrough();

    pipeline.pipe((chunk, line, next) => {
      lastMessage = chunk;
      next(chunk);
    });

    intf.consume(stream);

    stream.write('testChunk');
    setImmediate(() => {
      expect(lastMessage.toString('utf8')).to.be.equal('testChunk');
      // End stream
      stream.end();
      done();
    });
  });

  it('should trigger next event', function (done) {
    const stream = new PassThrough();

    pipeline.once('next', () => {
      // End stream
      stream.end();
      done();
    });
    
    intf.consume(stream);

    stream.write('test');
  });

  it('should catch sync errors', function (done) {
    const stream = new PassThrough();

    pipeline.pipe((chunk, line, next) => {
      if (chunk && (chunk.toString('utf8') === 'throwSyncError')) throw new Error('throwSyncError');
      next(chunk);
    }).once('error', (error) => {
      expect(error).to.be.an.instanceof(Error);
      expect(error).to.have.property('message', 'throwSyncError');
      // End stream
      stream.end();
      done();
    });

    intf.consume(stream);

    stream.write('throwSyncError');
  });

  it('should catch async errors', function (done) {
    const stream = new PassThrough();

    pipeline.pipe((chunk, line, next) => {
      if (chunk && (chunk.toString('utf8') === 'throwAsyncError')) return line.throw(new Error('throwAsyncError'));
      next(chunk);
    }).once('error', (error) => {
      expect(error).to.be.an.instanceof(Error);
      expect(error).to.have.property('message', 'throwAsyncError');
      // End stream
      stream.end();
      done();
    });

    intf.consume(stream);

    stream.write('throwAsyncError');
  });
});