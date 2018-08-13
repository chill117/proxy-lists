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
			nextLink: '.pagination li:nth-child(2) a',
		},
		parseAttributes: {
			ipAddress: '([0-9\.]+):[0-9]+$',
			port: function(port) {
				var match = port.match(/.+:([0-9]+)$/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
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
