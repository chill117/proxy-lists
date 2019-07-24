'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'Anonymous': 'anonymous',
		'No': 'transparent',
	},
};

var ProxyLists;

module.exports = {
	homeUrl: 'https://www.cool-proxy.net/',
	defaultOptions: {
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
				url: 'https://www.cool-proxy.net/',
			},
			items: [{
				selector: '#main table tbody tr:not(:first-child)',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
						parse: function(text) {
							if (!text) return null;
							var match = text && text.match(/([0-9.]+)/) || null;
							return match && match[1] || null;
						},
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
							return text && convert.anonymityLevels[text.trim()] || null;
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#main ul.pagination > li:nth-last-child(2) > a',
				},
			},
		}],
	},
};
