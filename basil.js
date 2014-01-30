'use strict';

/**
 * Module dependencies.
 */

var url = require('url');
var http = require('http');
var basil = Basil;


/**
 * Basil constructor
 */

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
  var bundle = {request: {}, reqBody: new Buffer(0), resBody: new Buffer(0)};

  clientRequest.on('data', function (buf) {
    bundle.reqBody = Buffer.concat([bundle.reqBody, buf]);
  });

  clientRequest.on('end', function () {
    basil.repeat(bundle, clientRequest, response, handlers);
  });
};

/**
 * On request end : start repeating server response
 */

basil.repeat = function (bundle, clientRequest, response, handlers) {
  basil.hydrate(bundle, clientRequest, handlers);
  var proxyRequest = http.request(bundle.request, function(serverResponse) {
    serverResponse.on('data', function (buf) {
      bundle.resBody = Buffer.concat([bundle.resBody, buf]);
    });

    serverResponse.on('end', function (buf) {
      basil.answer(bundle, clientRequest, response, serverResponse, handlers);
    });
  });

  proxyRequest.write(bundle.request.body);
  proxyRequest.end();
};

/**
 * Write response
 */

basil.answer = function (bundle, clientRequest, response, serverResponse, handlers) {
  basil.dehydrate(bundle, serverResponse, handlers);
  response.writeHeader(bundle.response.status, bundle.response.headers);
  response.write(bundle.response.body);
  response.end();
};

/**
 * Build request bundle from origin and middlewares
 */

basil.hydrate = function (bundle, request, handlers) {
  bundle.request = url.parse(request.url);
  bundle.request.headers = request.headers;
  bundle.request.method = request.method;
  bundle.request.agent = false;
  bundle.request.body = bundle.reqBody;

  basil.whisper(bundle, handlers);
};

/**
 * Build response bundle from origin and middlewares
 */

basil.dehydrate = function (bundle, response, handlers) {
  bundle.response = {};
  bundle.response.status = response.statusCode;
  bundle.response.headers = response.headers;
  bundle.response.body = bundle.resBody;

  basil.whisper(bundle, handlers);
};

/**
 * Exec all the middlewares
 */

basil.whisper = function (bundle, handlers) {
  handlers.forEach(function (handler) {
    handler(bundle);
  });
};
