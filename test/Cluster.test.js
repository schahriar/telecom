let state = global.mockInterfaces.cluster.state;
let telecom;

describe('Telecom Cluster Mock Test', function () {
  it('should create a master instance', function () {
    telecom = new Telecom();

    expect(telecom).to.have.property('parallelize');
    expect(telecom).to.have.property('pipeline');
    expect(telecom).to.have.property('isMaster', true);
  });

  it('should parallelize to given number of cores', function (done) {
    telecom.parallelize(5, () => {} /* noop */);
    setImmediate(() => {
      expect(state.totalForks).to.be.equal(5);
      done();
    });
  });
});