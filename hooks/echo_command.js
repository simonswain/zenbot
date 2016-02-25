"use strict";

var request = require('request');

var put = function(opts, message, done){

  console.log('COMMAND', message);
  done(null);
  
};

module.exports = {
  put: put
};
