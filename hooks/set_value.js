var put = function(opts, message, done){
  console.log('SET VALUE (simulated)', message.value);
  done();
};

module.exports = {
  put: put
};
