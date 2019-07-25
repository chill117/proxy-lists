'use strict';

var _ = require('underscore');
var ProxyLists;

module.exports = {
	homeUrl: 'https://hugeproxies.com/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
		scraping: {
			test: function(item) {
				ProxyLists = ProxyLists || require('../index');
				return ProxyLists.isValidProxy(item);
			},
		},
	},
	config: {
		lists: [{
			link: {
				url: 'https://hugeproxies.com/home/',
			},
			items: [{
				selector: '#content .post-content table tbody tr',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
					},
					{
						name: 'port',
						selector: 'td:nth-child(2)',
						parse: function(text) {
							var port = parseInt(text);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'anonymityLevel',
						selector: 'td:nth-child(6)',
						parse: function(anonymityLevel) {
							if (!anonymityLevel) return null;
							return anonymityLevel.trim().toLowerCase();
						},
					},
					{
						name: 'protocols',
						selector: 'td:nth-child(5)',
						parse: function(protocols) {
							if (!protocols) return null;
							return [protocols.trim().toLowerCase()];
						},
					},
				],
			}],
		}],
	},
};
