var util = require('util');

// Ulozi do souboru trackFilePath predane parametry v JSON.
// Funkce selze, pokud bude zavolana rychle za sebou: pokud probehne
// vice pozadavku rychle za sebou, je mozne, ze bude ulozen jen jeden z nich.
var saveQueries = function(trackFilePath, queries, io, callback) {
  io.readFile(trackFilePath, function(err, data) {
    if (err) callback(err);
    try {
      var content = JSON.parse(data);
      content.push(queries);
      var updatedJSON = JSON.stringify(content);
      io.writeFile(trackFilePath, updatedJSON, callback);
    } catch (e) {
      callback(e);
    }
  });
};

// Inkrementuje hodnotu v Redis pod klicem key o hodnotu query[key]
var increment = function(query, dbClient, key, callback) {
  var count = query[key];
  if (count) {
    var intval = parseInt(count);
    if (!isNaN(intval)) {
      dbClient.incrby(key, intval, function(err, data) {
        dbClient.save(); // ?
        callback(err, data);
      });
    } else {
      var errMessage = util.format('Parameter %s is not a number. Given value: %s', key, query.count);
      callback(new Error(errMessage));
    }
  } else {
    callback();
  }
};

var renderTemplate = function(err, next, res, doneCounter, renderData) {
  if (err) {
    next(err);
  } else {
    if (doneCounter === 2) {
      res.render('track', renderData);
    }
  }
};

/*
Funkce vraci routovaci funkci pro routu /track
trackFilePath:  Cesta k JSON souboru, do ktereho se bude zapisovat
dbClient:       Redis klient nebo jiny se stejnym rozhranim
io:             Objekt obsahujici funkce pro praci se soubory pod
                vlastnostmi writeFile a readFile. 
*/
var getTrackRoute = function(trackFilePath, dbClient, io) {
  return function(req, res, next) {
    var doneCounter = 0;
    var renderData = {};
    saveQueries(trackFilePath, req.query, io, function(err) {
      renderData.queries = req.query;
      renderData.isQueriesEmpty = Object.keys(req.query).length === 0;
      doneCounter++;
      renderTemplate(err, next, res, doneCounter, renderData);
    });
    increment(req.query, dbClient, 'count', function(err, newValue) {
      doneCounter++;
      renderData.count = newValue;
      renderTemplate(err, next, res, doneCounter, renderData);
    });
  };
};

module.exports = getTrackRoute;