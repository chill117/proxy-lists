'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'high anonymous': 'elite',
		anonymous: 'anonymous',
		none: 'transparent',
	},
	protocols: {
		http: 'http',
		https: 'https',
		socks4: 'socks4',
		socks5: 'socks5',
	},
};

module.exports = {
	homeUrl: 'http://freeproxylists.net/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 10000,
	},
	config: {
		lists: [
			{
				link: {
					url: 'http://freeproxylists.net/',
				},
				items: [
					{
						selector: 'table.DataGrid tbody tr:not(:first-child)',
						attributes: [
							{
								name: 'ipAddress',
								selector: 'td:nth-child(1) a',
								parse: function (text) {
									return text.trim() || null;
								},
							},
							{
								name: 'port',
								selector: 'td:nth-child(2)',
								parse: function (text) {
									var port = parseInt(text.trim());
									if (_.isNaN(port)) return null;
									return port;
								},
							},
							{
								name: 'protocols',
								selector: 'td:nth-child(3)',
								parse: function (text) {
									if (!text) return null;
									text = text.trim().toLowerCase();
									var protocol = convert.protocols[text] || 'http';
									return [protocol];
								},
							},
							{
								name: 'anonymityLevel',
								selector: 'td:nth-child(7)',
								parse: function (text) {
									if (!text) return null;
									text = text.trim().toLowerCase();
									return convert.anonymityLevels[text] || null;
								},
							},
						],
					},
				],
				pagination: {
					next: {
						selector: 'div.page a:last-child',
					},
				},
			},
		],
	},
};
