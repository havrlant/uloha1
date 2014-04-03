var express = require('express');
var redis = require('redis');
var util = require('util');

var initApp = require('./initApp');
var fsutil = require('./utils/fsutil');
var config = require('./config');

var startServer = function(config) {
  var redisClient = redis.createClient();
  var app = express();
  initApp(app, config, redisClient);
  var server = app.listen(config.port);
  console.log(util.format('I am listening on port %s.', config.port));

  redisClient.on("error", function(err) {
    console.error(err);
    app.render('error', {err: err});
  });

  server.on('close', function() {
    console.log('Closing Redis connection...');
    redisClient.quit();
  });
  return app;
};

// Pred startem weboveho serveru overime, jestli existuje JSON soubor,
// do ktereho se chystame zapisovat. Pokud neexistuje, vytvorime ho. 
fsutil.createFileIfNE(config.trackFilePath, JSON.stringify([]), function(err) {
  if (err) {
    console.error(err.message);
  } else {
    startServer(config);
  }
});
