'use strict';

var fs = require('fs');

module.exports = [
	{
		url: 'anon/d1445543510.html',
		data: fs.readFileSync(__dirname + '/anon01.xml')
	}
];
