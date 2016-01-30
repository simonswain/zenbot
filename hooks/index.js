"use strict";

var fs = require('fs');

module.exports = function(){

  var hooks = {};

  fs.readdirSync(__dirname).forEach(function(file) {

    if (file === 'index.js') {
      return;
    }

    if (file.substr(0,1) === '.') {
      return;
    }

    if (file.substr(0,1) === '#') {
      return;
    }

    if (!fs.statSync(__dirname + '/' + file).isFile()) {
      return;
    }

    var slug = file.substr(0, file.length - 3);
    hooks[slug] = require('./' + file);

  });

  return hooks;

}();
