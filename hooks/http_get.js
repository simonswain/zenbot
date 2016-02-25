"use strict";

var request = require('request');

var get = function(opts, done){

  request({
    method: 'GET',
    json: true,
    url: opts.url
  }, function (err, res, body) {

    if(err){
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    var message;

    // try{
    //   message = JSON.parse(body);
    // } catch(e){
    //   return done(e);
    // }

    done(null, message);

  });

};

module.exports = {
  get: get
};
