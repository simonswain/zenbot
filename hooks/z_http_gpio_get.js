// wiconnect_http_gpio_get

var request = require('request');

var init = function(opts, done){

  request({
    method: 'GET',
    json: true,
    url: opts.url + '/command/gpio_dir' + '%20' + opts.gpio + '%20' + 'in'
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

var get = function(opts, done){

  var url = opts.url + '/command/gpio_get' + '%20' + opts.gpio;
  console.log(url);
  
  request({
    method: 'GET',
    json: true,
    url: url
  }, function (err, res, body) {
    
    console.log(body);
    // { id: 25, code: 0, flags: 0, response: 'Set OK\r\n' }

    var value = body.response;
    value = Number(value);
    
    var message = {
      at: new Date().getTime(),
      value: value
    };
    console.log('****', message);
    if(err){
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    done(null, message);

  });
  
  
};

module.exports = {
  init: init,
  get: get
};
