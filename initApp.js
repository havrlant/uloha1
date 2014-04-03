var getTrackRoute = require('./routes/track');
var path = require('path');
var fsutil = require('./utils/fsutil');
var fs = require('fs');

var initApp = function(app, config, redisClient) {
  app.set('view engine', 'jade');
  app.set('views', path.join(__dirname, 'views'));
  app.use(app.router);

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.render('error', {'err': err});
  });

  // Routa /track bude cist/zapisovat data do souboru. 
  // Funkci vytvarejici routovaci funkci explicitne predame
  // funkce pro zapis a cteni souboru.
  var io = {
    writeFile: function(filepath, content, callback) {
      fsutil.atomicWriteFile(filepath, content, undefined, callback);
    },
    readFile: fs.readFile
  };

  app.get('/track', getTrackRoute(config.trackFilePath, redisClient, io));

  app.get('/', function(req, res){
    res.render('index');
  });
};

module.exports = initApp;