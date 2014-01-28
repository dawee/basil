'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
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
  var proxy = http.createServer();

  proxy.on('request', this.wakeup.bind(this));
  proxy.listen(port);
};

/**
 * On request event : init bundle
 */

Basil.prototype.wakeup = function (clientRequest, response) {
  var handlers = this.handlers;
  var bundle = {request: {}, reqBody: '', resBody: ''};

  clientRequest.on('data', function (buf) {
    bundle.reqBody += buf.toString();
  });

  clientRequest.on('end', function () {
    repeat(bundle, clientRequest, response, handlers);
  });
};

/**
 * On request end : start repeating server response
 */

var repeat = function (bundle, clientRequest, response, handlers) {
  hydrate(bundle, clientRequest, handlers);
  var proxyRequest = http.request(bundle.request, function(serverResponse) {
    serverResponse.on('data', function (buf) {
      bundle.resBody += buf.toString();
    });

    serverResponse.on('end', function (buf) {
      answer(bundle, clientRequest, response, serverResponse, handlers);
    });
  });

  proxyRequest.write(bundle.request.body);
  proxyRequest.end();
};

/**
 * Write response
 */

var answer = function (bundle, clientRequest, response, serverResponse, handlers) {
  dehydrate(bundle, serverResponse, handlers);
  response.writeHeader(bundle.response.status, bundle.response.headers);
  response.write(bundle.response.body);
  response.end();
};

/**
 * Build request bundle from origin and middlewares
 */

var hydrate = function (bundle, request, handlers) {
  bundle.request = url.parse(request.url);
  bundle.request.headers = request.headers;
  bundle.request.method = request.method;
  bundle.request.agent = false;
  bundle.request.body = bundle.reqBody;

  whisper(bundle, handlers);
};

/**
 * Build response bundle from origin and middlewares
 */

var dehydrate = function (bundle, response, handlers) {
  bundle.response = {};
  bundle.response.status = response.statusCode;
  bundle.response.headers = response.headers;
  bundle.response.body = bundle.resBody;

  whisper(bundle, handlers);
};

/**
 * Exec all the middlewares
 */

var whisper = function (bundle, handlers) {
  handlers.forEach(function (handler) {
    handler(bundle);
  });
};