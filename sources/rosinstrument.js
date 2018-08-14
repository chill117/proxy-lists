'use strict';

var _ = require('underscore');

var defineFeed = function(url) {
	return {
		requestOptions: {
			url: url,
			headers: {
				'User-Agent': 'Mozilla/5.0 Chrome/70.0.3000.60',
			}
		},
		paths: {
			group: 'rss/channel',
			item: 'item',
			attributes: {
				ipAddress: 'title/0',
				port: 'title/0',
			},
		},
		parseAttributes: {
			ipAddress: '(.+):[0-9]+',
			port: function(port) {
				var match = port.match(/.+:([0-9]+)/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
		},
	};
};

module.exports = {
	homeUrl: 'http://tools.rosinstrument.com/',
	abstract: 'xml',
	config: {
		feeds: [
			defineFeed('http://tools.rosinstrument.com/proxy/l100.xml'),
			defineFeed('http://tools.rosinstrument.com/proxy/plab100.xml'),
		],
	},
};
