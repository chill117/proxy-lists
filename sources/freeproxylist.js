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

module.exports = {
	homeUrl: 'https://free-proxy-list.net/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'https://free-proxy-list.net/',
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
		}],
	},
};
