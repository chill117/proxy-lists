'use strict';

var anonymityLevels = {
	'Transparent': 'transparent',
	'Distorting': 'anonymous',
	'Anonymous': 'elite',
	'Socks4': 'anonymous',
	'Socks5': 'anonymous',
};

var defineFeed = function(url) {
	return {
		url: url,
		paths: {
			group: 'rss/channel/0/item',
			item: 'prx:proxy',
			attributes: {
				ipAddress: 'prx:ip/0',
				port: 'prx:port/0',
				anonymityLevel: 'prx:type/0',
				protocols: 'prx:ssl/0',
			},
		},
		parseAttributes: {
			anonymityLevel: function(value) {
				if (value) {
					value = value.trim();
					value = anonymityLevels[value] || null;
				}
				return value || null;
			},
			protocols: function(value) {
				switch (this.anonymityLevel) {
					case 'Transparent':
					case 'Anonymous':
					case 'Distorting':
						return value === 'true' ? [ 'https' ] : [ 'http' ];
					case 'Socks4':
					case 'Socks5':
						return [ value.toLowerCase() ];
				}
				return [];
			},
		},
	};
};

module.exports = {
	homeUrl: 'https://www.xroxy.com/',
	abstract: 'xml',
	config: {
		feeds: [
			defineFeed('https://www.xroxy.com/proxyrss.xml'),
		],
	},
};
