'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://www.nntime.com/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'http://www.nntime.com/',
		selectors: {
			item: '#proxylist tbody tr',
			itemAttributes: {
				ipAddress: 'td:nth-child(2)',
				port: 'td:nth-child(2)',
			},
			nextLink: '#navigation .selected + a',
		},
		parseAttributes: {
			ipAddress: function(ipAddress) {
				var match = ipAddress.match(/^(.+)document/);
				return match && match[1] || null;
			},
			port: function(port) {
				var match = port.match(/:([0-9]+)$/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
		},
	},
};
