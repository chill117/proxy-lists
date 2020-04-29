'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'elite proxy': 'elite',
		'anonymous': 'anonymous',
		'transparent': 'transparent',
	},
	protocols: {
		'yes': 'https',
	},
};

var startUrls = [
	'https://free-proxy-list.net/',
	'https://www.us-proxy.org/',
	'https://free-proxy-list.net/uk-proxy.html',
	'https://www.sslproxies.org/',
	'https://free-proxy-list.net/anonymous-proxy.html',
];

var listDefinition = {
	link: {
		url: null,
	},
	items: [{
		selector: '#proxylisttable tbody tr',
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
				selector: 'td:nth-child(5)',
				parse: function(text) {
					if (!text) return null;
					text = text.trim().toLowerCase();
					return convert.anonymityLevels[text] || null;
				},
			},
			{
				name: 'protocols',
				selector: 'td:nth-child(7)',
				parse: function(text) {
					if (!text) return null;
					text = text.trim().toLowerCase();
					var protocol = convert.protocols[text] || 'http';
					return [protocol];
				},
			},
		],
	}],
	pagination: {
		next: {
			selector: '#proxylisttable_next > a',
		},
	},
}

module.exports = {
	homeUrl: 'https://free-proxy-list.net/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: _.map(startUrls, function(startUrl) {
			return _.extend({}, listDefinition, {
				link: { url: startUrl },
			});
		}),
	},
};
