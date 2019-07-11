'use strict';

var _ = require('underscore');
var async = require('async');
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');

var directories = {
	tmp: path.join(__dirname, 'tmp'),
};

module.exports = {
	directories: directories,
	createTmpDir: function(done) {
		mkdirp(directories.tmp, done);
	},
	destroyTmpDir: function(done) {
		fs.readdir(directories.tmp, function(error, files) {
			if (error) return done(error);
			async.each(files, function(fileName, next) {
				var filePath = path.join(directories.tmp, fileName);
				fs.unlink(filePath, next);
			}, function(error) {
				if (error) return done(error);
				fs.rmdir(directories.tmp, done);
			});
		});
	},
};
