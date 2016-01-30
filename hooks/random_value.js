var request = require('request');

var get = function(opts, done){

  var value = (Math.random() * 100).toFixed(2);

  var message = {
    at: new Date().getTime(),
    value: value
  };

  done(null, message);
  
};

module.exports = {
  get: get
};
