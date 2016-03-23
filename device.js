'use strict';

var async = require('async');
var _ = require('lodash');
var fs = require('fs');
var request = require('request');
var Ws = require('ws');


function Device(opts) {
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
  if(this.ws){
    this.ws.close();
  }
  return done();
};

Device.prototype.startWatchdog = function() {
  this.socketWatchdog();
};

Device.prototype.stopWatchdog = function() {
  if (this.watchdogTimer) {
    clearTimeout(this.watchdogTimer);
  }
};

Device.prototype.onSocketOpen = function() {
  var msg = {
    auth: this.opts.token,
  };
  this.ws.send(JSON.stringify(msg));
};

Device.prototype.onSocketError = function(err) {
  console.log('Socket Error', err.message);
};


Device.prototype.socketConnect = function() {
  this.ws = new Ws(this.opts.ws);
  this.ws.on('open', this.onSocketOpen.bind(this));
  this.ws.on('message', this.onSocketMessage.bind(this));
  this.ws.on('error', this.onSocketError.bind(this));
  this.socketWatchdog();
};

Device.prototype.socketWatchdog = function() {
  //console.log('watchdog');
  this.stopWatchdog();
  if (!this.ws) {
    this.socketconnect();
    return;
  }
  // WebSocket.CLOSED === 3
  if (this.ws.readyState === 3) {
    console.log('*** WATCHDOG RECONNECT');
    this.socketConnect();
  }
  this.watchdogTimer = setTimeout(this.socketWatchdog.bind(this), this.opts.watchdogPeriod);
};

Device.prototype.onSocketAuth = function(msg) {
  if (this.connectCallback) {
    if (msg.auth === 'ok') {
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

  if (msg.hasOwnProperty('auth')) {
    this.onSocketAuth(msg);
    return;
  }

  if (typeof this.rawMessageHandler === 'function') {
    this.rawMessageHandler(msg);
  }

  // deal with specific message types here

  if (msg.hasOwnProperty('action')) {

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
  if(!done){
    done = function(){};
  }
  this.disconnect(done);
};

// methods

Device.prototype.get = function(done) {

  request({
    method: 'GET',
    json: true,
    url: this.opts.rest + '/',
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    if (err) {
      console.log(err.message);
      process.exit(0);
    }
    if (res.statusCode !== 200) {
      console.log(err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};

Device.prototype.addStream = function(attrs, done) {

  request({
    method: 'POST',
    json: true,
    url: this.opts.rest + '/streams',
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    },
    body: attrs,
  }, function(err, res, body) {
    if (res.statusCode !== 200) {
      console.log('REST Err', err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};

Device.prototype.addMessage = function(slug, message, done) {

  if(!done){
    done = function(){};
  }

  var url = this.opts.rest + '/streams/' + slug + '/messages';

  var success = true;
  if (this.ws) {
    let msg = {
      action: 'stream:message',
      stream: slug,
      message: message
    };
    console.log('ws to cloud   <', JSON.stringify(msg));
    try {
      this.ws.send(JSON.stringify(msg));
    } catch (e) {
      // if error then try rest
      success = false;
      console.log('socket', e.message);
    }
    if (success) {
      return done();
    }
  }

  request({
    method: 'POST',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    },
    body: message,
  }, function(err, res, body) {
    if (err) {
      console.log(err.message);
      return done(err);
    }
    if (!res) {
      return done(new Error('server not available'));
    }
    if (res.statusCode !== 200) {
      console.log(err, body);
      return done(new Error('not found'));
    }
    done(err, body);
  });

};

Device.prototype.noRepeat = function(slug, done) {

  if (!this.ws) {
    return done();
  }

  let msg = {
    action: 'stream:repeat:off',
    stream: slug,
  };

  console.log('ws to cloud   <', JSON.stringify(msg));
  this.ws.send(JSON.stringify(msg));
  done();

};

Device.prototype.putFile = function(file, done) {

  if (file.path.substr(0, 1) === '/') {
    file.path = file.path.substr(1);
  }

  var url = this.opts.rest + '/files/' + file.path;

  if (!file.mime) {
    file.mime = 'application/octet-stream';
  }

  request({
    method: 'POST',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    },
    body: {
      mime: file.mime,
      base64: file.data.toString('base64')
    },
  }, function(err, res, body) {
    if (res.statusCode !== 200) {
      console.log('file upload error', err, body);
      return done(err);
    }
    done(err, body);
  });
};

Device.prototype.indexFiles = function(done) {

  var url = this.opts.rest + '/files';

  request({
    method: 'GET',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    if (res.statusCode !== 200) {
      console.log('file index error', err, body);
      return done(err);
    }
    done(err, body);
  });
};

Device.prototype.getFile = function(path, done) {

  if (path.substr(0, 1) === '/') {
    path = path.substr(1);
  }

  var url = this.opts.rest + '/files/' + path;

  request({
    method: 'GET',
    encoding: null,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    if (res.statusCode !== 200) {
      console.log('file get error', err, body);
      return done(err);
    }
    var file = {
      data: body,
      mime: res.headers['content-type']
    };

    done(err, file);
  });
};

Device.prototype.delFile = function(path, done) {

  if (path.substr(0, 1) === '/') {
    path = path.substr(1);
  }

  var url = this.opts.rest + '/files/' + path;

  request({
    method: 'DELETE',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    if (res.statusCode !== 200) {
      console.log('file del error', err, body);
      return done(err);
    }

    done(err);
  });
};


Device.prototype.indexActions = function(done) {

  var url = this.opts.rest + '/actions';

  request({
    method: 'GET',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    // if (res.statusCode !== 200) {
    //   console.log(err, body);
    //   return done(err);
    // }
    done(err, body);
  });
};

Device.prototype.performAction = function(action, attrs, done) {

  if(typeof attrs === 'function'){
    done = attrs;
    attrs = {};
  }

  var url = this.opts.rest + '/actions/' + action;

  var args = {
    method: 'POST',
    json: true,
    url: url,
    body: attrs,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  };

  request(args, function(err, res, body) {
    done(err, body);
  });

};

Device.prototype.indexData = function(done) {

  var url = this.opts.rest + '/data';

  request({
    method: 'GET',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    done(err, body);
  });
};

Device.prototype.getData = function(key, done) {

  var url = this.opts.rest + '/data/' + key;

  request({
    method: 'GET',
    json: true,
    url: url,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    done(err, body);
  });
};

Device.prototype.setData = function(key, value, done) {

  var url = this.opts.rest + '/data/' + key;

  request({
    method: 'POST',
    json: true,
    url: url,
    body: value,
    headers: {
      'Authorization': 'Bearer ' + this.opts.token
    }
  }, function(err, res, body) {
    done(err, body);
  });
};


function create(opts) {
  var device = new Device(opts);
  return device;
}

module.exports = {
  create: create
};
