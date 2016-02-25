"use strict";

var request = require('request');

var get = function(opts, done){

  var url = opts.url + '/command/adc' + '%20' + opts.gpio;

  // lookup table
  if(opts.hasOwnProperty('lut')){
    url += '%20' + opts.lut;
  }

  request({
    method: 'GET',
    json: true,
    url: url,
  }, function (err, res, body) {

    if(err){
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    var value = Number(body.response.trim());

    if(opts.hasOwnProperty('dp')){
      value = value.toFixed(opts.dp);
    }

    var message = {
      at: new Date().getTime(),
      value: value
    };

    done(null, message);

  });

};

module.exports = {
  get: get
};
