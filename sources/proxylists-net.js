'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://www.proxylists.net/',
	abstract: 'xml',
	config: {
		feeds: [
			{
				requestOptions: {
					url: 'http://www.proxylists.net/proxylists.xml',
					headers: {
						'User-Agent': 'Mozilla/5.0 Chrome/70.0.3000.60',
					}
				},
				paths: {
					group: 'rss/channel/0/item',
					item: 'prx:proxy',
					attributes: {
						ipAddress: 'prx:ip/0',
						port: 'prx:port/0',
						protocols: 'prx:type/0',
					},
				},
				parseAttributes: {
					port: function(port) {
						port = parseInt(port);
						if (_.isNaN(port)) return null;
						return port;
					},
					protocols: function(protocols) {
						return [protocols.trim().toLowerCase()];
					},
				},
			}
		],
	},
};
