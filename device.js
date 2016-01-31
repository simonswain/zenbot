'use strict';

var async = require('async');
var _ = require('lodash');
var request = require('request');
var Ws = require('ws');


function Device(opts){
  this.opts = {
    rest: opts.rest,
    ws: opts.ws,
    token: opts.token,
    watchdogPeriod: 5000
  };
  this.streams = [];
  this.ws = null;
  this.rawMessageHandler = null;
  this.watchdogTimer = null;
}

Device.prototype.connect = function(done) {
  this.connectCallback = done;
  this.socketConnect();
};

Device.prototype.disconnect = function(done) {
  this.stopWatchdog();
  this.ws.close();
  return done();
};

Device.prototype.startWatchdog = function(){
  this.socketWatchdog();
};

Device.prototype.stopWatchdog = function(){
  if(this.watchdogTimer){
    clearTimeout(this.watchdogTimer);
  }
};

Device.prototype.onSocketOpen = function(){
  var msg = {
    auth: this.opts.token,
  };
  this.ws.send(JSON.stringify(msg));
};

Device.prototype.onSocketError = function(err){
  console.log('Socket Error', err.message);
};


Device.prototype.socketConnect = function(){
  this.ws = new Ws(this.opts.ws);
  this.ws.on('open', this.onSocketOpen.bind(this));
  this.ws.on('message', this.onSocketMessage.bind(this));
  this.ws.on('error', this.onSocketError.bind(this));
  this.socketWatchdog();
};

Device.prototype.socketWatchdog = function(){
  //console.log('watchdog');
  this.stopWatchdog();
  if(!this.ws){
    this.socketconnect();
    return;
  }
  // WebSocket.CLOSED === 3
  if(this.ws.readyState === 3){
    console.log('*** WATCHDOG RECONNECT');
    this.socketConnect();
  }
  this.watchdogTimer = setTimeout(this.socketWatchdog.bind(this), this.opts.watchdogPeriod);
};

Device.prototype.onSocketAuth = function(msg){
  if(this.connectCallback){
    if(msg.auth === 'ok'){
      this.connectCallback();
    } else {
      this.connectCallback(new Error(msg.result));
    }
    this.connectCallback = null;
  }
};

Device.prototype.onSocketMessage = function(msg, flags) {
  msg = JSON.parse(msg);
  //console.log('ws > device', JSON.stringify(msg));

  if(msg.hasOwnProperty('auth')){
    this.onSocketAuth(msg);
    return;
  }

  if(typeof this.rawMessageHandler === 'function'){
    this.rawMessageHandler(msg);
  }

  // deal with specific message types here

  if(msg.hasOwnProperty('action')){

    // fire callback here

    // if (msg.action === 'stream:message') {
    //   console.log('from ws >', msg.stream, msg.message);
    // } else {
    //   console.log('>', msg);
    // }

  }
  //console.log('ws unhandled:', JSON.stringify(msg));
};

Device.prototype.quit = function(done) {
  this.disconnect();
  return done();
};

// methods

Device.prototype.get = function(done){

  request({
    method: 'GET',
    json: true,
    url: this.opts.rest + '/',
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function (err, res, body) {
    if(res.statusCode !== 200) {
      console.log(err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};

Device.prototype.addStream = function(attrs, done){

  request({
    method: 'POST',
    json: true,
    url: this.opts.rest + '/streams',
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    },
    body: attrs,
  }, function (err, res, body) {
    if(res.statusCode !== 200) {
      console.log('REST Err', err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};

Device.prototype.addMessage = function(slug, message, done){

  var url = this.opts.rest + '/streams/' + slug + '/messages';

  if(this.ws){
    let msg = {
      action: 'stream:message',
      stream: slug,
      message: message
    };
    console.log('ws to cloud   <', JSON.stringify(msg));
    this.ws.send(JSON.stringify(msg));
    return done();
  }

  request({
    method: 'POST',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    },
    body: message,
  }, function (err, res, body) {
    if(!res){
      return done(new Error('server not available'));
    }
    if(res.statusCode !== 200) {
      console.log(err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};


function create(opts){
  var device = new Device(opts);
  return device;
}

var virtualDevice = function(opts){

  var device = null;

  var api = {};


  api.addStream = function(stream, done){
    request({
      method: 'POST',
      url: opts.host + '/api/device/streams',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + opts.device_api_key
      },
      body: stream
    }, function (err, res, body) {
      done(err, body);
    });
  };

  api.addMessage = function(stream_id, message, done){
    request({
      method: 'POST',
      url: opts.host + '/api/device/streams/' + stream_id + '/messages',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + opts.device_api_key
      },
      body: message
    }, function (err, res) {
      done(err);
    });
  };

  var getDevice = function(next){
    api.getDevice(function(err, res){
      device = res;
      next(err);
    });
  };

  var makeStreams = function(next){
    console.log('streams:');
    async.eachSeries(opts.streams, function(x, cb){
      var stream = x.stream;
      if(_.findWhere(device.streams, {slug: stream.slug})){
        console.log(' *', stream.schema, '/' + stream.slug, '"' + stream.title + '"');
        x.stream = _.findWhere(device.streams, {slug: stream.slug});
        x.stream_id = x.stream.id;
        x.slug = x.stream.slug;
        return cb();
      }
      api.addStream(stream, function(err, res){
        console.log(' +', stream.schema, '/' + stream.slug, '"' + stream.title + '"');
        x.stream = res;
        x.stream_id = res.id;
        x.slug = x.stream.slug;
        cb();
      });
    }, next);
  };


  var initHooks = function(next){
    async.eachSeries(opts.streams, function(stream, cb){
      initHook(stream, cb);
    }, next);
  };


  var initHook = function(stream, done){

    if(!done){
      done = function(){};
    }

    // no init method
    if(!stream.hook){
      return done();
    }

    if(!hooks.hasOwnProperty(stream.hook)){
      console.log('hook', stream.hook, 'not available');
      return done();
    }

    if(!hooks[stream.hook].hasOwnProperty('init')){
      return done();
    }

    if(!stream.hasOwnProperty('opts')){
      stream.opts = {};
    }

    // bind to hook emitter if it exists
    if(hooks[stream.hook].hasOwnProperty('listen')){
      console.log('hook bind', stream.hook);
      hooks[stream.hook].listen(function(message){
        onHook(stream, message);
      });
    };

    // initialize hook
    hooks[stream.hook].init(stream.opts, function(err, message){
      if(err){
        console.log('hook init failed', stream.hook, err);
        return done();
      }
      console.log('hook init', stream.hook);
      return done();
    });

  };

  var onHook = function(stream, message){

    if(!stream.hasOwnProperty('opts')){
      stream.opts = {};
    }

    if(message.hasOwnProperty('value')){
      console.log('hook emit', stream.hook,  '>', stream.stream.slug, message.value);
    } else {
      console.log('hook emit', stream.hook,  '>', stream.stream.slug);
    }

    api.addMessage(stream.stream.id, message, function(){});

  };

  var getHook = function(stream, done){

    if(!done){
      done = function(){};
    }

    if(!stream.hasOwnProperty('opts')){
      stream.opts = {};
    }

    console.log('calling hook', stream.hook,  '>', stream.stream.slug);
    hooks[stream.hook].get(stream.opts, function(err, message){
      if(err){
        console.log('hook get failed', stream.hook,  '>', stream.stream.slug, err);
        return done();
      }

      if(message.hasOwnProperty('value')){
        console.log('hook get', stream.hook,  '>', stream.stream.slug, message.value);
      } else {
        console.log('hook get', stream.hook,  '>', stream.stream.slug);
      }

      api.addMessage(stream.stream.id, message, function(){
        done();
      });

    });
  };

  // inject a message from the api to a stream on the device.

  var putHook = function(stream, message, done){

    if(!done){
      done = function(){};
    }

    if(!stream.hasOwnProperty('opts')){
      stream.opts = {};
    }

    if(!hooks[stream.hook].hasOwnProperty('put')){
      return done(new Error('put hook not available'));
    }

    if(message.hasOwnProperty('value')){
      console.log('hook put', stream.hook,  '>', stream.stream.slug, message.value);
    } else {
      console.log('hook put', stream.hook,  '>', stream.stream.slug);
    }

    hooks[stream.hook].put(stream.opts, message, function(err, message){

      if(err){
        console.log('hook put failed', stream.hook,  '>', stream.stream.slug, err);
        return done();
      }

      //console.log('putHook DONE', stream.hook,  '>', stream.stream.slug);
      done();

    });

  };

  var startReporting = function(next){

    _.each(opts.streams, function(stream){

      if(!stream.hasOwnProperty('hook')){
        return;
      }

      if(!stream.hasOwnProperty('interval')){
        return;
      }

      stream.caller = function(){
        getHook(stream, function(){
          setTimeout(stream.caller, stream.interval);
        })
      };

      stream.caller();

    });
    next();

  };

  var start = function(){
    console.log('device api key:', opts.device_api_key);
    async.series([
      getDevice,
      makeStreams,
      initHooks,
      startReporting
    ]);
  };

  return {
    start: start
  }

};

module.exports = {
  create: create
};
