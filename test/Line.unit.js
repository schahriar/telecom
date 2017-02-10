let PassThrough = require('stream').PassThrough;
let line;
let stream = new PassThrough();

describe("Line Unit Tests", function () {
  it('should create a new Line', function () {
    line = new Line(stream, new Map(), 4);

    expect(line).to.have.property("state");
    expect(line).to.have.property("write");
    expect(line).to.have.property("end");
    expect(line).to.have.property("throw");
    expect(line).to.have.property("catch");
    expect(line).to.have.property("pushBack");
  });

  it('should get/set state', function () {
    line.state.x = 2;
    expect(line.state).to.have.property('x', 2);
  });

  it('should switch state as index progresses', function () {
    line._setState(1);
    expect(line.state.x).to.be.undefined;
    line.state.y = true;
    expect(line.state).to.have.property('y', true);
  });

  it('should persist state', function () {
    line._setState(0);
    expect(line.state).to.have.property('x', 2);
  });

  it('should write to stream', function (done) {
    stream.once('data', (chunk) => {
      expect(chunk.toString('utf8')).to.be.equal('test');
      done();
    });

    line.write('test');
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