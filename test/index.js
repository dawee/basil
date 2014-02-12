/*global describe, it*/
'use strict';

var assert = require('assert');
var Basil = require('../');

describe('Basil', function () {
  describe('constuctor', function () {
    it('should instanciate with `new`', function () {
      var basil = new Basil();

      assert(basil instanceof Basil);
    });
    it('should instanciate when called', function () {
      /*jshint newcap: false*/
      var basil = Basil();
      /*jshint newcap: true*/

      assert(basil instanceof Basil);
    });
  });
  describe('handler', function() {
    it('should add handler when "use" is called', function (done) {
      var app = new Basil();

      app.use(function () {
        done();
      });

      app.whisper({}, app.handlers);
    });
  });
});
