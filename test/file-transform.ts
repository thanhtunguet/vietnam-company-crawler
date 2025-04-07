// test/fileTransform.js
module.exports = {
  process(src) {
    return 'module.exports = ' + JSON.stringify(src) + ';';
  },
};
