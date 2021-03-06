let intf;
let consumer = () => {};
let countedConsumer = (counter) => {
  return () => {
    counter();
  }
};
let PassThrough = require('stream').PassThrough;

describe("Interface Unit Tests", function () {
  it('should create a new interface', function () {
    intf = new Interface();

    expect(Interface).to.be.extensible;
    expect(intf).to.be.extensible;
    expect(intf).to.have.property("pool");
    expect(intf.pool).to.be.instanceOf(Set);
  });
  
  it('should add a new consumer', function () {
    intf.addConsumer(consumer);
    expect(intf.hasConsumer(consumer)).to.be.true;
  });
  
  it('should remove a consumer', function () {
    intf.removeConsumer(consumer);
    expect(intf.hasConsumer(consumer)).to.be.false;
  });

  it('should consume streams to all consumers', function () {
    let c = 0;
    let streamCount = 4;
    const stream = new PassThrough();
    const counter = () => c++;
    
    // Add consumers
    for (let i = 0; i < streamCount; i++) {
      intf.addConsumer(countedConsumer(counter));
    }

    // Consume stream
    intf.consume(stream);
    expect(c).to.be.equal(streamCount);
  });

  it('should throw errors', function (done) {
    intf.once('error', (error) => {
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('message', 'testError');

      done();
    });

    intf.throw(new Error('testError'));
  });

  it('should log debug events', function (done) {
    intf.once('debug', (l1, l2) => {
      expect(l1).to.be.equal('@l1');
      expect(l2).to.be.equal('@l2');
      done();
    });

    intf.debug('@l1', '@l2');
  });
});