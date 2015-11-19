'use strict';

var fs = require('fs');

module.exports = {
	http: fs.readFileSync(__dirname + '/http.html'),
	https: fs.readFileSync(__dirname + '/https.html'),
	socks: fs.readFileSync(__dirname + '/socks.html')
};
