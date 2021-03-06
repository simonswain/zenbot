"use strict";

var _ = require('lodash');
var async = require('async');
var path = require('path');

var Device = require('./device.js');
var hooks = require('./hooks');

var softDevice;
var device;
var server;

var config, token;

if(process.argv.length === 3){
  config = require('./caps/default.js');
  token = process.argv[2];
} else if (process.argv.length === 4){
  try{
    config = require(path.join(__dirname, 'caps', process.argv[2]));
  } catch(e){
    console.log('Cannot find caps', process.argv[2]);
    process.exit();
  }
  token = process.argv[3];
} else {
  console.log('Usage: ' + process.argv[1] + '[caps] <token>');
  process.exit();
}

if(config.cloud){
  console.log('Cloud REST', config.cloud.rest);
  console.log('Cloud WS  ', config.cloud.ws);
}

if (!config.server) {
  config.server = {
    host: '127.0.0.1',
    port: 6002
  };
}


var functions = _.clone(config.functions);

var createServer = (next) => {

  server = require('./server')(config.server);

  server.start(() => {
    console.log(config.server.host + ':' + config.server.port);
  });

  process.on('SIGINT', () => {
    console.log(config.nickname + ' webapp ' + config.env + ' ' + 'stopping...');
    server.stop(() => {
      console.log(config.nickname + ' webapp ' + config.env + ' ' + 'finished');
    });
  });
};


var createSoftDevice = (next) => {
  softDevice = Device.create({
    rest: config.cloud.rest,
    ws: config.cloud.ws,
    token: token
  });
  next();
};

var getDevice = (next) => {
  softDevice.get((err, res) => {
    if(!res){
      console.log('Token not on cloud. Create a new Device on the cloud to get a token.');
      process.exit();
    }
    device = res;
    console.log('device', device.title);
    console.log('code  ', device.code);
    console.log('owner ', device.user);
    next();
  });
};

var getStreams = (next) => {
  softDevice.getStreams((err, res) => {
    if(!res){
      process.exit();
    }
    device.streams = res;
    next();
  });
};

var makeStreams = (next) => {
  async.eachSeries(functions, (fn, cb) => {
    if(!fn.hasOwnProperty('opts')){
      fn.opts = {};
    }

    if(_.find(device.streams, {slug: fn.stream})){
      console.log('*', fn.schema, '/' + fn.stream, '"' + fn.title + '"');
      return cb();
    }

    if(!fn.stream) {
      return cb();
    }

    let stream = {
      slug: fn.stream,
      title: fn.title,
      schema: fn.schema,
      panel: fn.panel,
      detail: fn.detail,
      options: fn.options
    };

    softDevice.addStream(
      stream,
      () => {
        console.log('+', fn.schema, '/' + fn.stream, '"' + fn.title + '"');
        cb();
      });
  }, next);
};

var initHook = (fn, done) => {

  // no init method
  if(!fn.hook){
    return done();
  }

  if(!hooks.hasOwnProperty(fn.hook)){
    console.log('hook', fn.hook, 'not available');
    return done();
  }

  if(!hooks[fn.hook].hasOwnProperty('init')){
    return done();
  }

  // bind to hook emitter if it exists
  if(hooks[fn.hook].hasOwnProperty('listen')){
    console.log('hook bind', fn.hook);
    hooks[fn.hook].listen(
      (message) => {
        onHook(fn, message);
      });
  }

  fn.opts.device = softDevice;

  // initialize hook
  hooks[fn.hook].init(
    fn.opts,
    (err) => {
      if(err){
        console.log('hook init failed', fn.hook, err);
        return done();
      }
      console.log('hook init', fn.hook, fn.stream || '');
      return done();
    });
};

var onHook = (fn, message) => {

  if(fn.target) {
    var target = _.find(config.functions, {
      stream: fn.target
    });

    hooks[target.hook].put(target.opts, message, () => {
      softDevice.addMessage(fn.target, message, () => {});
    });
  }

  if(!fn.stream) {
    return;
  }

  if(message.hasOwnProperty('value')){
    console.log('hook emit', fn.hook,  '>', fn.stream, message.value);
  } else {
    console.log('hook emit', fn.hook,  '>', fn.stream);
  }

  softDevice.addMessage(fn.stream, message, () => {});

};

var getHook = (fn, done) => {

  if(!done){
    done = () => {};
  }

  fn.opts.device = softDevice;

  //console.log('calling hook', fn.hook,  '>', fn.stream);
  hooks[fn.hook].get(fn.opts, (err, message) => {
    if(err){
      console.log('hook get failed', fn.hook,  '>', fn.stream, err);
      return done();
    }

    if(!message || typeof message !== 'object'){
      return done();
    }

    if(message.hasOwnProperty('value')){
      console.log('hook get', fn.hook,  '>', fn.stream, message.value);
    } else {
      console.log('hook get', fn.hook,  '>', fn.stream);
    }

    softDevice.addMessage(fn.stream, message, () => {
      done();
    });

  });
};

// inject a message from the api to a stream on the device.

var putHook = (fn, message, done) => {

  if(!done){
    done = () => {};
  }

  if(!hooks[fn.hook]){
    return done();
  }

  if(!hooks[fn.hook].hasOwnProperty('put')){
    return done(new Error('put hook not available'));
  }

  if(message.hasOwnProperty('value')){
    console.log('hook put', fn.hook,  '>', fn.stream, message.value);
  } else {
    console.log('hook put', fn.hook,  '>', fn.stream);
  }

  hooks[fn.hook].put(fn.opts, message, (err, message) => {

    if(err){
      console.log('hook put failed', fn.hook,  '>', fn.stream, err);
      return done();
    }

    console.log('putHook DONE', fn.hook,  '>', fn.stream);
    done();

  });

};

var initHooks = (next) => {
  async.eachSeries(
    functions,
    initHook,
    next
  );
};

var onMessage = (msg) => {

  if(msg.action === 'stream:message'){
    var fn = _.find(functions, {stream: msg.stream});
    if(!fn){
      console.log(' message: not found', JSON.stringify(msg));
      return;
    }

    console.log('ws from cloud >', 'streams/' + fn.stream, JSON.stringify(msg.message));

    // is it a command we have to process here? this overrides getHook
    if(fn.schema === 'command' && fn.hasOwnProperty('execute')) {
      var target = _.find(functions, {stream: fn.execute});
      console.log('execute', fn.stream, '>', fn.execute);
      return getHook(target);
    }

    // try and call stream's hook with the message.
    putHook(fn, msg.message);
    return;
  }

};

var connectDevice = (next) => {
  softDevice.rawMessageHandler = onMessage;
  softDevice.connect(() => {
    async.eachSeries(
      functions,
      (fn, cb) => {
        if(!fn.norepeat){
          return cb();
        }
        softDevice.noRepeat(fn.stream, cb);
      }, next);
  });
};

var startReporting = (next) => {

  _.each(functions, (fn) => {

    if(!fn.hasOwnProperty('hook')){
      return;
    }

    if(!fn.hasOwnProperty('interval')){
      return;
    }

    fn.caller = () => {
      getHook(fn, () => {
        setTimeout(fn.caller, fn.interval);
      });
    };

    fn.caller();

  });

  next();

};

async.series([
  //  createServer,
  createSoftDevice,
  getDevice,
  getStreams,
  makeStreams,
  initHooks,
  connectDevice
], (err) => {
  console.log('running.');
  startReporting(()=>{});
});
