'use strict';

module.exports = {
	src: [
		'sources/*.js',
		'test/**/*.js',
		'cli.js',
		'countries.js',
		'gruntFile.js',
		'index.js'
	],
	options: {
		config: '.jscsrc',
		requireCurlyBraces: [ 'if', 'for', 'while' ]
	}
};
