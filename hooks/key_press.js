'use strict';

const readline = require('readline');

var handler;

var init = function(opts, done) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.input.on('keypress', function(ch, key) {

    if (ch === '1') {
      var message = {
        at: new Date().getTime(),
        value: ch
      };

      handler(message);
    }
  });

  done();
};

var listen = function(cb) {
  handler = cb;
};

module.exports = {
  init: init,
  listen: listen
};