'use strict';

var _ = require('underscore');
var ProxyLists;

module.exports = {
	homeUrl: 'https://premproxy.com/',
	defaultOptions: {
		defaultTimeout: 5000,
		scraping: {
			test: function(item) {
				ProxyLists = ProxyLists || require('../index');
				return ProxyLists.isValidProxy(item);
			},
		},
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'https://premproxy.com/list/',
			},
			items: [{
				selector: '#proxylistt tbody tr[class]',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
						parse: function(ipAddress) {
							if (!ipAddress) return null;
							if (ipAddress.indexOf(':') !== -1) {
								ipAddress = ipAddress.split(':')[0];
							}
							return ipAddress;
						},
					},
					{
						name: 'port',
						selector: 'td:nth-child(1)',
						parse: function(port) {
							if (!port) return null;
							if (port.indexOf(':') !== -1) {
								port = port.split(':')[1];
							}
							port = parseInt(port);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'anonymityLevel',
						selector: 'td:nth-child(2)',
						parse: function(anonymityLevel) {
							if (!anonymityLevel) return null;
							return anonymityLevel.trim();
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#navbar ul.pagination li:last-child > a',
				},
			},
		}],
	},
};
