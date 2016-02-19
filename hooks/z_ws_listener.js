"use strict";

var Ws = require('ws');
var request = require('request');

var socket;
var device;

var onMessage = function(e){
  //console.log('message', e.data);
  var json = JSON.parse(e.data);
  //console.log(json.stream, json.data);
  var message = {
    value: Number(json.data)
  };
  device.addMessage(json.stream, message, () => {});

};

var onOpen = function(e){
  console.log('open');
  registerListener('button1');
  registerListener('button2');
};

var onError = function(e){
  console.log('error', e);
};

var onClose = function(e){
  //console.log('close', e);
};

var registerListener = function(key){
  var p = {
    stream: key,
    method: 'listen'
  };
  console.log(p);
  socket.send(JSON.stringify(p));
};

var init = function(opts, done){

  device = opts.device;

  socket = new Ws(opts.url);
  socket.onopen = onOpen;
  socket.onmessage = onMessage;
  socket.onclose = onClose;
  socket.onerror = onError;

  console.log(opts);
  console.log('init');
  done(null);

};

var stop = function(done){
};

module.exports = {
  init: init,
  stop: stop
};
