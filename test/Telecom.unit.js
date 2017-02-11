let EventEmitter = require('events').EventEmitter;
let telecom;

describe("Interface Unit Tests", function () {
  it('should create a new interface', function () {
    telecom = new Telecom();

    expect(telecom).to.be.an.instanceOf(EventEmitter);
    expect(telecom).to.have.property('parallelize');
    expect(telecom).to.have.property('pipeline');
    expect(telecom).to.have.property('isMaster', true);
  });

  it('should return bundled interfaces', function () {
    expect(telecom.interfaces).to.be.an.Object;
    expect(telecom.interfaces).to.have.property('TCP');
  });

  it('should create a new pipeline', function () {
    let intf = new telecom.interfaces.TCP(8000);
    expect(intf).to.be.an.instanceOf(Interface);

    let pipeline = telecom.pipeline(intf);
    expect(pipeline).to.be.an.instanceOf(Pipeline);
  });
});