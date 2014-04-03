var util = require('util');
var express = require('express');
var initApp = require('../../initApp.js');

describe('app', function() {
  describe('.render("error", fn)', function() {
    it('should print error message if an error occurred', function(done) {
      var app = express();
      initApp(app, {});
      var errorMessage = 'The end of the World.';
      app.locals.err = new Error(errorMessage);
      app.render('error', function(err, str) {
        str.should.containEql(util.format('<p id="description"><strong>%s</strong></p>', errorMessage));
        done();
      });
    });
  });
});