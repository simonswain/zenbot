"use strict";

// wiconnect_http_gpio_set

var request = require('request');

var init = function(opts, done){

  request({
    method: 'GET',
    json: true,
    url: opts.url + '/command/gpio_dir' + '%20' + opts.gpio + '%20' + 'out'
  }, function (err, res, body) {

    //console.log(body);

    if(err){
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    done();

  });

};

var put = function(opts, message, done){
  request({
    method: 'GET',
    json: true,
    url: opts.url + '/command/gpio_set' + '%20' + opts.gpio + '%20' + message.value
  }, function (err, res, body) {

    //console.log(body);
    // { id: 25, code: 0, flags: 0, response: 'Set OK\r\n' }

    if(err){
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    done();

  });
};

module.exports = {
  init: init,
  put: put
};
