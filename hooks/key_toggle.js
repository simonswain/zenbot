'use strict';

var readline = require('readline');
var exec = require('child_process').exec;

var handler;
var state;

var init = function(opts, done) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if(!opts.key){
    opts.key = ' ';
  }

  rl.input.on('keypress', function(ch, key) {
    if (ch === opts.key) {
      state = !state;

      var message = {
        at: new Date().getTime(),
        value: state ? 1 : 0
      };
      handler(message);
    }
  });
  done();
};

var put = function(opts, message, done) {
  state = Number(message.value);

  var cmd;
  cmd = 'xset ';

  if (state === 0) {
    cmd += '-';
  }

  cmd += 'led 3';

  exec(cmd, function(error, stdout, stderr) {
    done();
  });
};

var listen = function(cb) {
  handler = cb;
};

module.exports = {
  init: init,
  listen: listen,
  put: put
};
