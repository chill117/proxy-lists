'use strict';

var _ = require('underscore');
var ProxyLists;

module.exports = {
	homeUrl: 'https://premproxy.com/',
	abstract: 'scraper-paginated-list',
	defaultOptions: {
		waitForValidData: {
			test: function(item) {
				ProxyLists = ProxyLists || require('../index');
				return ProxyLists.isValidProxy(item);
			},
			checkFrequency: 50,
			timeout: 2000,
		},
	},
	config: {
		startPageUrl: 'https://premproxy.com/list/',
		selectors: {
			item: '#proxylistt tbody tr[class]',
			itemAttributes: {
				ipAddress: 'td:first-child',
				port: 'td:first-child',
				anonymityLevel: 'td:nth-child(2)',
			},
			nextLink: '#navbar ul.pagination li:last-child > a',
		},
		parseAttributes: {
			ipAddress: function(ipAddress) {
				if (!ipAddress) return null;
				if (ipAddress.indexOf(':') !== -1) {
					ipAddress = ipAddress.split(':')[0];
				}
				return ipAddress;
			},
			port: function(port) {
				if (!port) return null;
				if (port.indexOf(':') !== -1) {
					port = port.split(':')[1];
				}
				port = parseInt(port);
				if (_.isNaN(port)) return null;
				return port;
			},
			anonymityLevel: function(anonymityLevel) {
				return anonymityLevel.trim();
			},
		},
	},
};
