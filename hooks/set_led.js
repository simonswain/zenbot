var exec = require('child_process').exec;

var put = function(opts, message, done){
  console.log(message);
  var cmd;
  cmd = '/usr/bin/python /home/pi/led_status.py ' + message.value;
  exec(cmd, function(error, stdout, stderr){
    console.log(cmd);
  });

};

module.exports = {
  put: put
};
