let PassThrough = require('stream').PassThrough;
let line;
let processors = [() => "P1", () => "P2"];
let stream = new PassThrough();

describe("Line Unit Tests", function () {
  it('should create a new Line', function () {
    line = new Line({ test: true });
    line.pipe(stream);

    expect(line).to.have.property("state");
    expect(line).to.have.property("write");
    expect(line).to.have.property("end");
    expect(line).to.have.property("throw");
    expect(line).to.have.property("catch");
    expect(line).to.have.property("unshift");
  });

  it('should get/set state', function () {
    line._setProcessor(processors[0]);
    line.state.x = 2;
    expect(line.state).to.have.property('x', 2);
  });

  it('should switch state as index progresses', function () {
    line._setProcessor(processors[1]);
    expect(line.state.x).to.be.undefined;
    line.state.y = true;
    expect(line.state).to.have.property('y', true);
  });

  it('should persist state', function () {
    line._setProcessor(processors[0]);
    expect(line.state).to.have.property('x', 2);
  });

  it('should write to stream', function (done) {
    stream.once('data', (chunk) => {
      expect(chunk.toString('utf8')).to.be.equal('test');
      done();
    });

    line.write('test');
  });

  it('should support unshift in a stream', function (done) {
    stream.once('data', (chunk) => {
      line.unshift(chunk);

      expect(chunk.toString('utf8')).to.be.equal('test2');
      expect(line._hasPushedBackChunks()).to.be.true;
      expect(line._getPushedBackChunks().toString('utf8')).to.be.equal('test2');
      done();
    });

    line.write('test2');
  });

  it('should end a stream', function (done) {
    let gotData = false;
    stream.once('data', (chunk) => {
      expect(chunk.toString('utf8')).to.be.equal('testEnd');
      gotData = true;
    });
    stream.once('end', (chunk) => {
      expect(gotData).to.be.true;
      done();
    });

    line.end('testEnd');
  });
});