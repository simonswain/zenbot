var fs = require('fs');

var get = function(opts, done){

  var s = fs.readFile(opts.file, 'utf8', function(err, res){
    //console.log(res);
    if(err){
      return done(err);
    }
    try{
      var json = JSON.parse(res);
    } catch(err){
      return done(err);
    }
    var value = json[opts.key];
      var message = {
        value: value
      };
    done(null, message);
  });
};

module.exports = {
  get: get
};
