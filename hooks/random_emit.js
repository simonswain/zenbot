var request = require('request');

// this is an example hook you should use as a base to make your own
// from.

// this hook emits a value periodically, which the device will push to
// the API. You might use it to consume a remote data feed, or to
// respond to physical inputs in real-time.

// the #init method should set up any infrastructure required to
// receive external inputs. The emit function should generate a schema
// compliant message and send it to the handler provided by the
// device. The message you construct will be sent verbatim to the
// cloud

// for this example we use a simple setInterval. You probably don't
// want to be doing this for a real-world application.

var timer;
var handler;

var emit = function(){

  var value = (Math.random() * 100).toFixed(2);

  var message = {
    at: new Date().getTime(),
    value: value
  };

  handler(message);

};

var init = function(opts, done){
  setInterval(emit, 5000);
  done();
};

var listen = function(cb){
  handler = cb;
};

module.exports = {
  init: init,
  listen: listen
};
