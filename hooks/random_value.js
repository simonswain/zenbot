"use strict";

var request = require('request');

var get = function(opts, done){

  var value;

  if(!opts.dp){
    opts.dp = 2;
  }
  
  if(opts.hasOwnProperty('base') && opts.hasOwnProperty('flux')){
    value = Number(opts.base + (Math.random() * opts.flux).toFixed(opts.dp));
  } else {
    value = Number((Math.random() * 100).toFixed(opts.dp));
  }

var message = {
  at: new Date().getTime(),
  value: value
};

done(null, message);

};

module.exports = {
  get: get
};
