const fs = require('fs');
const morjs = require('morjs');
const package = JSON.parse(fs.readFileSync('./package.json'));
const README = fs.readFileSync('./README.md').toString('utf8');

const vStart = README.indexOf('<!--VERSION_START-->') + '<!--VERSION_START-->'.length;
const vEnd = README.indexOf('<!--VERSION_END-->');
const versionMors = morjs.encode(package.version, {mode: 'simple'});
const versionString = `v${package.version} \`${versionMors}\``;
const currentString = README.slice(vStart, vEnd);

fs.writeFileSync('./README.md', README.slice(0, vStart) + versionString + README.slice(vStart + versionString.length));

if (versionString !== currentString) throw new Error('Invalid Version found on README.md, version has been automatically updated, please republish');