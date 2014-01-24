'use strict';

/**
 * Module dependencies.
 */

var http = require('http');

function Basil() {
  if (!(this instanceof Basil)) return new Basil;

  this.handlers = [];
}

/**
 * Expose `Basil`.
 */

exports = module.exports = Basil;

/**
 * @api public : 'use'
 * Use the middleware 'handler'
 */

Basil.prototype.use = function (handler) {
  this.handlers.push(handler);
};

/**
 * @api public : 'listen'
 * Starts the web server
 */

Basil.prototype.listen = function (port) {
  var handlers = this.handlers;
  
  http.createServer(function (reqA, resA) {
    var reqB = {};

    hydrate(reqA, reqB, handlers);
    http.request(reqB, grab(reqA, reqB, resA, handlers)).end();
  }).listen(port);
};

/**
 * Execute all the middlewares to hydrate the request reqB
 */

var hydrate = function (reqA, reqB, handlers) {
  handlers.forEach(function (handler) {
    handler(reqA, reqB, null, null, null);
  });
};

/**
 * Returns the request grabber
 */

var grab = function (reqA, reqB, resA, handlers) {
  return function (resB) {
    var bundle = {data: ''};

    feed(resB, bundle);
    end(reqA, reqB, resA, resB, bundle, handlers);
  };
};

/**
 * Feed the data from the server response
 */

var feed = function (resB, bundle) {
  resB.on('data', function (buffer) {
    bundle.data += buffer.toString();
  });
};

/**
 * Execute all the middlewares to dehydrate the response resB
 */

var dehydrate = function (reqA, reqB, resA, resB, bundle, handlers) {
  handlers.forEach(function (handler) {
    handler(reqA, reqB, resA, resB, bundle.data);
  });
};

/**
 * Listen the 'end' event and close the response resA
 */

var end = function (reqA, reqB, resA, resB, bundle, handlers) {
  resB.on('end', function () {
    dehydrate(reqA, reqB, resA, resB, bundle, handlers);
    resA.end();
  });
};