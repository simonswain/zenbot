"use strict";

var request = require('request');

var put = function(opts, message, done){

  // this is a stub hook you should copy and modify for your needs. 

  // here it should set the value on the physical device, and call
  // `done` when finished.

  // message.value will contain a float value for you to use. You may
  // want to compare message.at with the most recent at you have for
  // the device, to a race condition

  //console.log('GOT CONTROL MESSAGE', message);
  done(null);
  
};

module.exports = {
  put: put
};
