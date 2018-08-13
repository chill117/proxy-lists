'use strict';

var _ = require('underscore');

var anonymityLevels = {
	'No': 'transparent',
	'Medium': 'anonymous',
	'High': 'elite',
};

module.exports = {
	homeUrl: 'https://hidemyna.me/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://hidemyna.me/en/proxy-list',
		selectors: {
			item: '.proxy__t tbody tr',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
				protocols: 'td:nth-child(5)',
				anonymityLevel: 'td:nth-child(6)',
			},
			nextLink: '.proxy__pagination .is-active + li a',
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
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevels[anonymityLevel.trim()] || null;
			},
		},
	},
};
