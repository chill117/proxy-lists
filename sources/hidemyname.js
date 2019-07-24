'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'no': 'transparent',
		'medium': 'anonymous',
		'high': 'elite',
	},
};

module.exports = {
	homeUrl: 'https://hidemyna.me/',
	defaultOptions: {
		defaultTimeout: 10000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'https://hidemyna.me/en/proxy-list',
			},
			items: [{
				selector: '.proxy__t tbody tr',
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
						parse: function(text) {
							if (!text) return null;
							return convert.anonymityLevels[text.trim().toLowerCase()] || null;
						},
					},
					{
						name: 'protocols',
						selector: 'td:nth-child(5)',
						parse: function(text) {
							if (!text) return null;
							return [text.trim().toLowerCase()];
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '.proxy__pagination .is-active + li a',
				},
			},
		}],
	},
};
