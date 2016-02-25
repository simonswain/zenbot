"use strict";

var exec = require('child_process').exec;
var fs = require('fs');
var moment = require('moment');

var get = function(opts, done){

  var path = '/tmp/snap-' + new Date().getTime() + '.jpeg';

  var filename = 'webcam.jpg';

  if(opts && opts.filename){
    filename = opts.filename;
  }
  
  var command = '/usr/bin/streamer -q -f jpeg -o ' + path;

  exec(
    command,
    function (err, stdout, stderr) {

      if(err){
        console.log(err.message);
        return done();
      }

      console.log('snapped laptop webcam', path);

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
              value: 'Laptop Cam ' + moment().format('YYYY-MM-DD HH:mm:ss Z')
            };

            done(null, message);
          });
        });
    });

};

module.exports = {
  get: get
};
