'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'noa': 'transparent',
		'anm': 'anonymous',
		'hia': 'elite',
	},
};

var listUrls = [
	'http://spys.one/en/https-ssl-proxy/',
	'http://spys.one/en/socks-proxy-list/',
	'http://spys.one/en/http-proxy-list/',
	'http://spys.one/en/anonymous-proxy-list/',
	'http://spys.one/en/non-anonymous-proxy-list/',
];

var listDefinition = {
	items: [{
		selector: 'table table tbody tr:nth-child(n+4)',
		attributes: [
			{
				name: 'ipAddress',
				selector: 'td:nth-child(1) font:nth-child(2)',
				parse: function(text) {
					if (!text) return null;
					var match = text.match(/^([0-9]{1,3}[.-][0-9]{1,3}[.-][0-9]{1,3}[.-][0-9]{1,3})document\.write\(/);
					return match && match[1] || null;
				},
			},
			{
				name: 'port',
				selector: 'td:nth-child(1) font:nth-child(2)',
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
					return convert.anonymityLevels[text.trim().toLowerCase()];
				},
			},
			{
				name: 'protocols',
				selector: 'td:nth-child(2)',
				parse: function(text) {
					if (!text) return null;
					var match = text.match(/(https?|socks[45])( \([a-z0-9]+\))?/i);
					if (!match || !match[1]) return null;
					return [match[1].trim().toLowerCase()];
				},
			},
		],
	}],
	pagination: {
		next: {
			selector: 'table table tbody tr:nth-child(2) td a:last-child',
		},
	},
};

module.exports = {
	homeUrl: 'http://spys.one/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: _.map(listUrls, function(listUrl) {
			return _.extend({}, listDefinition, {
				link: {
					url: listUrl,
				},
			});
		}),
	},
};
