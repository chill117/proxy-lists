'use strict';

var _ = require('underscore');

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
			port: function(port) {
				var match = port.trim().match(/([0-9]+)$/);
				if (!match || !match[1]) return null;
				port = parseInt(match[1]);
				if (_.isNaN(port)) return null;
				return port;
			},
			protocols: function(protocols) {
				return convert.protocols[protocols.trim()] || [];
			},
		},
	},
};
