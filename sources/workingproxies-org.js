'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'elite proxy': 'elite',
		'anonymous': 'anonymous',
		'transparent': 'transparent',
	},
	protocols: {
		'yes': ['https'],
	},
};

module.exports = {
	homeUrl: 'http://www.workingproxies.org/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'http://www.workingproxies.org/',
		selectors: {
			item: '.proxies tbody tr:not(:last-child)',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
			},
			nextLink: '.paginator .page.current + .page:not(.current) a',
		},
		parseAttributes: {
			port: function(port) {
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
		},
	},
};

