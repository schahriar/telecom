const fs = require('fs');
const path = require('path');
const docs = require('jsdoc-to-markdown');

let docMap = {
  '../Telecom.js': './Telecom.md',
  '../lib/Interface.js': './Interface.md',
  '../lib/Line.js': './Line.md',
  '../lib/Pipeline.js': './Pipeline.md'
};

for (const file in docMap) {
  console.log(">", path.resolve(__dirname, file));
  docs.render({ files: path.resolve(__dirname, file) }).then((markdown) => {
    fs.writeFileSync(path.resolve(__dirname, docMap[file]), markdown);
  });
}