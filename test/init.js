// Mock Interface
global.mockInterfaces = {
  cluster: {}
};

let proxyquire =  require('proxyquire');
global.Telecom = proxyquire('../Telecom', { cluster: require('./mock/cluster.js') });
global.Interface = require('../lib/Interface');
global.Line = require('../lib/Line');
global.Pipeline = require('../lib/Pipeline');
global.expect = require('chai').expect;

// Unit Tests
require('./Interface.unit.js');
require('./Line.unit.js');
require('./Pipeline.unit.js');
require('./Telecom.unit.js');
require('./Cluster.test.js');