var util = require('util');
var express = require('express');
var initApp = require('../../initApp.js');

describe('app', function() {
  describe('.render("track", fn)', function() {
    it('should print all query parameters', function(done) {
      var app = express();
      initApp(app, {});
      app.locals.queries = {'a':1, 'b':2};
      app.locals.isQueriesEmpty = false;
      app.render('track', function(err, str) {
        str.should.containEql('<ul><li>a: 1</li><li>b: 2</li></ul>');
        done();
      });
    });

    it('should print all query parameters and info about count parameter if present', function(done) {
      var app = express();
      initApp(app, {});
      app.locals.queries = {'a':1, 'b':2, 'count':15};
      app.locals.isQueriesEmpty = false;
      app.locals.count = 30;
      app.render('track', function(err, str) {
        str.should.containEql(util.format('<p>V parametrech byl i parametr <code>count</code> Aktualizoval jsem hodnotu v databázi. Současná hodnota je: <strong>%s</strong>.</p>', app.locals.count));
        done();
      });
    });

    it('should print some info message if no query parameter is present', function(done) {
      var app = express();
      initApp(app, {});
      app.locals.queries = {};
      app.locals.isQueriesEmpty = true;
      app.render('track', function(err, str) {
        str.should.containEql('<p>Přidejte do URL nějaké parametry, jinak se nic nestane. Například <a href="?a=1&amp;b=2">tyto parametry</a>.</p>');
        done();
      });
    });
  });
});
