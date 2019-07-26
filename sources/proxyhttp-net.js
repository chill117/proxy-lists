'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'transparent': 'transparent',
		'anonymous': 'anonymous',
		'high': 'elite',
	},
	protocols: {
		'': ['https'],
		'-': ['http'],
	},
};

module.exports = {
	homeUrl: 'https://proxyhttp.net/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'https://proxyhttp.net/',
			},
			items: [{
				selector: 'table.proxytbl tr:nth-child(n+2):not(:nth-last-child(1))',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
					},
					{
						name: 'port',
						selector: 'td:nth-child(2)',
						parse: function(text) {
							console.log('text', '"' + text + '"')
							var match = text.trim().match(/[^0-9]([0-9]+)$/);
							if (!match || !match[1]) return null;
							var port = parseInt(match[1]);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'anonymityLevel',
						selector: 'td:nth-child(4)',
						parse: function(text) {
							if (!text) return null;
							return convert.anonymityLevels[text.trim().toLowerCase()];
						},
					},
					{
						name: 'protocols',
						selector: 'td:nth-child(5)',
						parse: function(text) {
							if (!text) return null;
							return convert.protocols[text.trim().toLowerCase()];
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#pages a.current + a',
				},
			},
		}],
	},
};
