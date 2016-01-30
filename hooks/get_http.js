var request = require('request');

var get = function(opts, done){

  request({
    method: 'GET',
    json: true,
    url: opts.url
  }, function (err, res, body) {
    
    if(err){
      console.log(body);
      return done(err);
    }

    if(res.statusCode === 404) {
      return done(new Error('failed'));
    }

    console.log(body);

    var data;
    try{
      data = JSON.parse(body);
    }catch(e){
      return done();
    }

    done(null, data);

  });

};

module.exports = {
  get: get
};
