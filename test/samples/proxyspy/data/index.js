'use strict';

var fs = require('fs');

module.exports = [{
	txt: fs.readFileSync(__dirname + '/proxy.txt', 'utf8')
}];
