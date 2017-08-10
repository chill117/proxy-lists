'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');

var excludedFiles = [
	'index.js',
];

var files = _.filter(fs.readdirSync(__dirname), function(file) {
	return !_.contains(excludedFiles, file);
});

_.each(files, function(file) {
	var name = file.split('.')[0];
	var filePath = path.join(__dirname, file);
	module.exports[name] = require(filePath);
});
