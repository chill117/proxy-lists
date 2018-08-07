'use strict';

var _ = require('underscore');

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
			},
			nextLink: '.proxy__pagination .is-active + li a',
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
