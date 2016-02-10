'use strict';

const readline = require('readline');

var handler;

var init = function(opts, done) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if(!opts.key){
    opts.key = ' ';
  }

  rl.input.on('keypress', function(ch, key) {

    if (ch === opts.key) {
      var message = {
        at: new Date().getTime(),
        value: Math.floor(new Date().getTime() / 1000)
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
