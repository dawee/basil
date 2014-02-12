'use strict';

/**
 * Module dependencies.
 */
var url = require('url');
var http = require('http');

/**
 * Basil constructor
 */
var Basil = module.exports = function () {
  if (! (this instanceof Basil)) {
    return new Basil();
  }

  this.handlers = [];
};

/**
 * Use the middleware 'handler'
 *
 * @param {Function} handler
 * @return {Basil}
 */
Basil.prototype.use = function (handler) {
  this.handlers.push(handler);

  return this;
};

/**
 * Starts the web server
 *
 * @param {Number} port
 * @return {Basil}
 */
Basil.prototype.listen = function (port) {
  if (this._proxy) {
    throw new Error('Already listening.');
  }

  this._proxy = http.createServer();

  this._proxy.on('request', this.wakeup.bind(this));
  this._proxy.listen(port);

  return this;
};

/**
 * On request event: init bundle
 */
Basil.prototype.wakeup = function (clientRequest, response) {
  var handlers = this.handlers;
  var bundle = {request: {}, reqBody: new Buffer(0), resBody: new Buffer(0)};

  clientRequest.on('data', function (buf) {
    bundle.reqBody = Buffer.concat([bundle.reqBody, buf]);
  });

  clientRequest.on('end', function () {
    this.repeat(bundle, clientRequest, response, handlers);
  }.bind(this));
};

/**
 * On request end: start repeating server response
 */
Basil.prototype.repeat = function (bundle, clientRequest, response, handlers) {
  this.hydrate(bundle, clientRequest, handlers);
  var proxyRequest = http.request(bundle.request, function(serverResponse) {
    serverResponse.on('data', function (buf) {
      bundle.resBody = Buffer.concat([bundle.resBody, buf]);
    });

    serverResponse.on('end', function () {
      this.answer(bundle, clientRequest, response, serverResponse, handlers);
    }.bind(this));
  }.bind(this));

  proxyRequest.write(bundle.request.body);
  proxyRequest.end();
};

/**
 * Write response
 */
Basil.prototype.answer = function (bundle, clientRequest, response, serverResponse, handlers) {
  this.dehydrate(bundle, serverResponse, handlers);
  response.writeHeader(bundle.response.status, bundle.response.headers);
  response.write(bundle.response.body);
  response.end();
};

/**
 * Build request bundle from origin and middlewares
 */
Basil.prototype.hydrate = function (bundle, request, handlers) {
  bundle.request = url.parse(request.url);
  bundle.request.headers = request.headers;
  bundle.request.method = request.method;
  bundle.request.agent = false;
  bundle.request.body = bundle.reqBody;

  this.whisper(bundle, handlers);
};

/**
 * Build response bundle from origin and middlewares
 */
Basil.prototype.dehydrate = function (bundle, response, handlers) {
  bundle.response = {};
  bundle.response.status = response.statusCode;
  bundle.response.headers = response.headers;
  bundle.response.body = bundle.resBody;

  this.whisper(bundle, handlers);
};

/**
 * Exec all the middlewares
 */
Basil.prototype.whisper = function (bundle, handlers) {
  handlers.forEach(function (handler) {
    handler(bundle);
  });
};
