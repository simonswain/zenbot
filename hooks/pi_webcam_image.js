"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');

var get = function(opts, done){

  var path = '/tmp/snap-' + new Date().getTime() + '.jpg';

  var filename = 'webcam.jpg';

  if(opts && opts.filename){
    filename = opts.filename;
  }

  var cmd;
  cmd = '/opt/vc/bin/raspistill';
  cmd += ' --output ' + path + '';
  cmd += ' --encoding jpg';
  cmd += ' --width 1024';
  cmd += ' --height 768';

  exec(
    cmd,
    function(err, stdout, stderr){

      if(err){
        console.log(err.message);
        return done();
      }

      console.log('snapped pi webcam', path);

      fs.readFile(
        path,
        (err, data) => {
          if(!data){
            return done();
          }
          opts.device.putFile({ 
            path: filename,
            data: data,
            mime: 'image/jpeg'
          }, (err, res) => {

            var message  = {
              at: new Date().getTime(),
              value: 'Pi Cam ' + moment().format('YYYY-MM-DD HH:mm:ss Z')
            };

            done(null, message);
          });
        });
    });

};

module.exports = {
  get: get
};
