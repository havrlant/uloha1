var path = require('path');

var config = {};

config.datafolder = path.join(__dirname, 'data');
config.trackFilename = 'track.json';
config.trackFilePath = path.join(config.datafolder, config.trackFilename);

config.port = 3000;

module.exports = config;