'use strict';

var convert = {
	protocols: {
		'4': ['socks4'],
		'5': ['socks5'],
		'4/5': ['socks4', 'socks5'],
	},
};

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
				protocols: 'td:nth-child(4)',
			},
			nextLink: '#pages .current + a',
		},
		parseAttributes: {
			port: '([0-9]+)[\n ]+$',
			protocols: function(protocols) {
				return convert.protocols[protocols.trim()] || [];
			},
		},
	},
};
