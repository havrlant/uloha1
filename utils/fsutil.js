var fs = require('fs');
var errno = require('errno');
var path = require('path');
var util = require('util');

// Funkce vytvori soubor, pokud uz dany soubor neexistuje
var createFileIfNE = function(filepath, content, callback) {
  fs.open(filepath, 'wx', function(err, fd) {
    if (err) {
      if (err.errno === errno.code.EEXIST.errno) {
        callback();
      } else {
        callback(err);
      }
    } else {
      fs.write(fd, content, undefined, undefined, function(err, written) {
        if (err) {
          fs.close(fd);
          callback(err);
        } else {
          fs.close(fd);
          callback();
        }
      });
    }
  });
};

// Naivni funkce pro atomicky zapis dat na disk.
// Funkce nejdrive vytvori docasny soubor, do ktereho zapise data
// a nasledne presune tento docasny soubor na predane umisteni. 
// Pokud je funkce zavolana ve stejny cas dvakrat, tak selze,
// protoze se pokusi vytvorit vice docasnych souboru na stejne ceste.
// Funkce pri vytvareni  docasneho souboru netestuje, 
// zda uz takovy soubor neexistuje.
var atomicWriteFile = function(filepath, content, prefix, callback) {
  prefix = prefix || '_';
  var dir = path.dirname(filepath);
  var id = new Date().getTime();
  var tempfilename = util.format("%s%s.temp", prefix, id);
  var tempPath = path.join(dir, tempfilename);
  fs.writeFile(tempPath, content, function(err) {
    if (err) {
      callback(err);
    } else {
      fs.rename(tempPath, filepath, callback);
    }
  });
};

module.exports.createFileIfNE = createFileIfNE;
module.exports.atomicWriteFile = atomicWriteFile;