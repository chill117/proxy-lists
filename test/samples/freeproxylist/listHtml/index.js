'use strict';

var fs = require('fs');

module.exports = [
	fs.readFileSync(__dirname + '/1.html'),
	fs.readFileSync(__dirname + '/2.html')
];
