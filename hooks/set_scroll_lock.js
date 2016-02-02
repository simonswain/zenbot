var exec = require('child_process').exec;

var put = function(opts, message, done) {
  var cmd;
  cmd = 'xset ';

  if (Number(message.value) === 0) {
    cmd += '-';
  }

  cmd += 'led 3';

  exec(cmd, function(error, stdout, stderr) {
    done();
  });
};

module.exports = {
  put: put
};