global.Telecom = require('../Telecom');
global.Interface = require('../lib/Interface');
global.Line = require('../lib/Line');
global.expect = require('chai').expect;

// Unit Tests
require('./Interface.unit.js');
require('./Line.unit.js');
//require('./Pipeline.unit.js');