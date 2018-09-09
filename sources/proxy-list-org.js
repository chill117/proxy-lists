'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://proxy-list.org/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://proxy-list.org/english/index.php',
		selectors: {
			item: '#proxy-table .table ul',
			itemAttributes: {
				ipAddress: 'li.proxy',
				port: 'li.proxy',
				protocols: 'li.https',
				anonymityLevel: 'li.type',
			},
			nextLink: '.pagination li:nth-child(2) a, .table-menu a.next',
		},
		parseAttributes: {
			ipAddress: function(str) {
				var match = str.match(/([0-9\.]+):[0-9]+$/);
				if (match && match[1]) {
					return match[1];
				}
				var base64 = str.split("'");
				if (base64 && base64.length === 3) {
					var addr = Buffer.from(base64[1], 'base64').toString('utf8');
					match = addr.match(/([0-9\.]+):[0-9]+$/);
					if (match && match[1]) {
						return match[1];
					}
				}
				return null;
			},
			port: function(port) {
				var match = port.match(/.+:([0-9]+)$/);
				if (match && match[1]) {
					port = parseInt(match[1]);
					if (!_.isNaN(port)) return port
				}
				var base64 = str.split("'");
				if (base64 && base64.length === 3) {
					var addr = Buffer.from(base64[1], 'base64').toString('utf8');
					match = addr.match(/.+:([0-9]+)$/);
					if (match && match[1]) {
						return match[1];
					}
				}
				return null
			},
			protocols: function(protocols) {
				return [protocols.trim().toLowerCase()];
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel.trim().toLowerCase();
			},
		},
	},
};
