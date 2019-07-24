'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://proxydb.net/',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'http://proxydb.net/',
			},
			items: [{
				selector: 'table tbody tr',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:first-child a',
						parse: function(text) {
							if (!text) return null;
							if (text.indexOf(':') !== -1) {
								text = text.split(':')[0];
							}
							return text;
						},
					},
					{
						name: 'port',
						selector: 'td:first-child a',
						parse: function(text) {
							if (!text) return null;
							if (text.indexOf(':') !== -1) {
								text = text.split(':')[1];
							}
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
							return text.trim().toLowerCase();
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
					selector: '.pagination button',
				},
			},
		}],
	},
};
