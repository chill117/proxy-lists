'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://tools.rosinstrument.com/',
	abstract: 'xml',
	config: {
		feeds: [
			{
				urls: [
					'http://tools.rosinstrument.com/proxy/l100.xml',
					'http://tools.rosinstrument.com/proxy/plab100.xml',
				],
				itemsPath: 'rss/channel/0/item',
				itemAttributePaths: {
					ipAddress: 'title/0',
					port: 'title/0',
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
			}
		],
	},
};
