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
				anonymityLevel: 'description/0',
				protocols: 'description/0',
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
			anonymityLevel: function(anonymityLevel) {
				if (!anonymityLevel) return null;
				var match = anonymityLevel.match(/(anonym|elite)/i);
				if (!match || !match[1]) return null;
				switch (match[1].toLowerCase()) {
					case 'anonym':
						return 'anonymous';
					case 'elite':
						return 'elite';
				}
				return null;
			},
			protocols: function(protocols) {
				if (!protocols) return null;
				var match = protocols.match(/(ssl|socks)/i);
				if (!match || !match[1]) return null;
				switch (match[1].toLowerCase()) {
					case 'socks':
						return ['socks4', 'socks5'];
				}
				return null;
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
