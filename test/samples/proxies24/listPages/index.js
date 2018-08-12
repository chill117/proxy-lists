'use strict';

var fs = require('fs');

module.exports = {
	http: fs.readFileSync(__dirname + '/http.html'),
};
