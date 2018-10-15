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
	homeUrl: 'https://free-proxy-list.net/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://free-proxy-list.net/',
		selectors: {
			item: '#proxylisttable tbody tr',
			itemAttributes: {
				anonymityLevel: 'td:nth-child(5)',
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
				protocols: 'td:nth-child(7)',
			},
			nextLink: '#proxylisttable .pagination li.active + li a',
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
				return protocols && convert.protocols[protocols] || ['http'];
			},
		},
	},
};
