"use strict";

var _ = require('lodash');
var async = require('async');
var Hapi = require('hapi');
var Path = require('path');

module.exports = (config) => {

  config = config || {};

  if (!config.server) {
    config.server = {
      host: '127.0.0.1',
      port: 6002
    };
  }

  var root = __dirname + '/public';
  var server = new Hapi.Server();

  server.connection({
    host: config.server.host,
    port: config.server.port
  });

  server.register(require('vision'), (err) => {
    if (err) {
      console.log('Failed to load vision.');
    }
    server.views({
      engines: {
        html: require('handlebars')
      },
      path: Path.join(__dirname, 'views'),
      isCached: (config.env !== 'development')
    });
  });

  server.register(require('inert'), (err) => {
    if (err) {
      console.log('Failed to load inert.');
    }
  });

  // server rendered views

  var appHandler = function (request, reply) {
    reply.view('index', {
    });
  };
  
  
  server.route({
    method: 'GET',
    path: '/',
    handler: appHandler
  });

  server.route({
    method: 'GET',
    path: '/js/{path*}',
    handler: {
      directory: {
        path: Path.join(__dirname, 'public/js'),
        listing: false,
        index: false
      }
    }
  });

  server.register({
    register: require('hapi-less'),
    options: {
      home: __dirname + '/public/less',
      route: '/css/{filename*}',
      less: {
        compress: true
      }
    }
  }, (err) => {});


  var start = (done) => {
    server.start(done);
  };

  var stop = (done) => {
    server.stop(next)
  };

  return {
    start: start,
    stop: stop
  };

};
