'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://premproxy.com/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://premproxy.com/list/',
		selectors: {
			item: '#proxylistt tbody tr[class]',
			itemAttributes: {
				ipAddress: 'td:first-child',
				port: 'td:first-child',
				anonymityLevel: 'td:nth-child(2)',
			},
			nextLink: '.pagination .active + li a',
		},
		parseAttributes: {
			ipAddress: 'IP:port (.+):[0-9]+',
			port: function(port) {
				var match = port.match(/IP:port .+:([0-9]+)/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
			anonymityLevel: 'Anonymity Type: ([a-z]+) ',
		},
	},
};
