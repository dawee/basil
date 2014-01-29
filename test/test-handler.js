'use strict';

var assert = require("assert");
var basil = require('..');

describe('handler', function(){
 
  it('should add handler when "use" is called', function () {
    var app = basil();
    var witness = 0;
    
    app.use(function () {
        witness++;
    });

    basil.whisper({}, app.handlers);
    assert.equal(1, witness);
  });

})