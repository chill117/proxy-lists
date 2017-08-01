'use strict';

var fs = require('fs');

module.exports = [
	fs.readFileSync(__dirname + '/1.script'),
	fs.readFileSync(__dirname + '/2.script'),
];
