var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');

var get = function(opts, done){

  var cmd;
  cmd = 'cat /sys/class/thermal/thermal_zone0/temp';
  exec(cmd, function(error, stdout, stderr){

    console.log('read cpu temp', stdout);

    var temp = Number(stdout);
    if(isNaN(temp)){
      return done();
    }
    temp = Number((temp / 1000).toFixed(2));
    
    var message  = {
      at: new Date().getTime(),
      value: temp
    };

    done(null, message);

  });

};

module.exports = {
  get: get
};
