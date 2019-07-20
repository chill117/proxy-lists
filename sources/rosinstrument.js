'use strict';

var _ = require('underscore');

var defineFeed = function(url) {
	return {
		url: url,
		paths: {
			group: 'rss/channel',
			item: 'item',
			attributes: {
				ipAddress: 'title/0',
				port: 'title/0',
			},
		},
		parseAttributes: {
			ipAddress: function(ipAddress) {
				if (!ipAddress) return null;
				var match = ipAddress.match(/([0-9]{1,3}[.-][0-9]{1,3}[.-][0-9]{1,3}[.-][0-9]{1,3})/);
				if (!match || !match[1]) return null;
				ipAddress = match[1].replace(/-/g, '.');
				return ipAddress;
			},
			port: function(port) {
				if (!port) return null;
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
