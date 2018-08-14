'use strict';

var _ = require('underscore');

var anonymityLevels = {
	'anonymous': 'anonymous',
	'distorting': 'elite',
	'socks4': 'anonymous',
	'socks5': 'anonymous',
	'transparent': 'transparent',
};

module.exports = {
	homeUrl: 'https://www.xroxy.com/',
	abstract: 'xml',
	config: {
		feeds: [
			{
				requestOptions: {
					url: 'https://[2001:19f0:200:2eda:6c3d:287b:0:1]/proxyrss.xml',
					agentOptions: {
						rejectUnauthorized: false,
					},
					headers: {
						'Accept': 'application/xml',
						'Host': 'www.xroxy.com',
						'User-Agent': 'Mozilla/5.0 Chrome/70.0.3000.60',
					}
				},
				paths: {
					group: 'rss/channel/0/item',
					item: 'prx:proxy',
					attributes: {
						ipAddress: 'prx:ip/0',
						port: 'prx:port/0',
						protocols: 'prx:ssl/0',
						anonymityLevel: 'prx:type/0',
					},
				},
				parseAttributes: {
					port: function(port) {
						port = parseInt(port);
						if (_.isNaN(port)) return null;
						return port;
					},
					protocols: function(ssl) {
						var anonymityLevel = this.anonymityLevel && this.anonymityLevel.trim().toLowerCase();
						if (anonymityLevel) {
							switch (anonymityLevel) {
								case 'socks4':
								case 'socks5':
									return [anonymityLevel];
							}
						}
						return [ssl === 'true' ? 'https' : 'http'];
					},
					anonymityLevel: function(anonymityLevel) {
						return anonymityLevels[anonymityLevel.trim().toLowerCase()] || null;
					},
				},
			}
		],
	},
};
