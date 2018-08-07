'use strict';

module.exports = {
	homeUrl: 'https://sockslist.net/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://sockslist.net/proxy/server-socks-hide-ip-address',
		selectors: {
			item: '.proxytbl tbody tr:not(:first-child)',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
			},
			nextLink: '#pages .current + a',
		},
		parseAttributes: {
			port: '([0-9]+)[\n ]+$',
		},
	},
};
