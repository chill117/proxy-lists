'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'distorting': 'elite',
		'anonymous': 'anonymous',
		'transparent': 'transparent',
	},
	protocols: {
		'socks4': ['socks4'],
		'socks5': ['socks5'],
	},
};

module.exports = {
	homeUrl: 'http://www.proxylists.net/',
	abstract: 'xml',
	config: {
		feeds: [
			{
				requestOptions: {
					url: 'http://www.proxylists.net/proxylists.xml',
					headers: {
						'Accept': 'application/xml',
						'Host': 'www.proxylists.net',
						'User-Agent': 'Mozilla/5.0 Chrome/70.0.3000.60',
					}
				},
				paths: {
					group: 'rss/channel/0/item',
					item: 'prx:proxy',
					attributes: {
						anonymityLevel: 'prx:type/0',
						ipAddress: 'prx:ip/0',
						port: 'prx:port/0',
						protocols: 'prx:type/0',
					},
				},
				parseAttributes: {
					anonymityLevel: function(anonymityLevel) {
						anonymityLevel = anonymityLevel && anonymityLevel.trim().toLowerCase() || null;
						return anonymityLevel && convert.anonymityLevels[anonymityLevel] || null;
					},
					port: function(port) {
						port = parseInt(port);
						if (_.isNaN(port)) return null;
						return port;
					},
					protocols: function(protocols) {
						protocols = protocols && protocols.trim().toLowerCase() || null;
						return protocols && convert.protocols[protocols] || null;
					},
				},
			}
		],
	},
};
