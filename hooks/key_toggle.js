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

  rl.input.on('keypress', function(ch, key) {
    if (ch === '2') {
      var message = {
        at: new Date().getTime(),
        value: state ? 0 : 1
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