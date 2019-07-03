'use strict';

var _ = require('underscore');

var anonymityLevels = {
	'Anonymous': 'anonymous',
	'Socks4': 'anonymous',
	'Socks5': 'anonymous',
	'Distorting': 'elite',
	'Transparent': 'transparent',
};

module.exports = {
	homeUrl: 'https://www.xroxy.com/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://www.xroxy.com/free-proxy-lists/',
		selectors: {
			item: '#DataTables_Table_0 > tbody > tr',
			itemAttributes: {
				ipAddress: 'td:nth-child(1)',
				port: 'td:nth-child(2)',
				anonymityLevel: 'td:nth-child(3)',
			},
			nextLink: '#DataTables_Table_0_paginate > ul > li.paginate_button.active + li.paginate_button a',
		},
		parseAttributes: {
			port: function(port) {
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevels[anonymityLevel.trim()] || null;
			},
		},
	},
};
