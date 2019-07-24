'use strict';

var _ = require('underscore');
var ProxyLists;

var convert = {
	anonymityLevels: {
		'high-anonymous': 'elite',
		'anonymous': 'anonymous',
		'anonymous proxy': 'anonymous',
		'transparent': 'transparent',
		'transparent proxy': 'transparent',
	},
};

module.exports = {
	homeUrl: 'http://www.nntime.com/',
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
				url: 'http://www.nntime.com/',
			},
			items: [{
				selector: '#proxylist tbody tr',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(2)',
						parse: function(text) {
							if (!text) return null;
							var match = text.match(/^(.+)document/);
							return match && match[1] || null;
						},
					},
					{
						name: 'port',
						selector: 'td:nth-child(2)',
						parse: function(text) {
							if (!text) return null;
							var match = text.match(/:([0-9]+)$/);
							if (!match || !match[1]) return null;
							var port = parseInt(match[1]);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'anonymityLevel',
						selector: 'td:nth-child(3)',
						parse: function(text) {
							if (!text) return null;
							return convert.anonymityLevels[text.trim().toLowerCase()] || null;
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#navigation a:nth-last-of-type(1)',
				},
			},
		}],
	},
};


