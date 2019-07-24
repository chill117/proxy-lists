'use strict';

var _ = require('underscore');

var startUrls = [
	'http://www.freeproxylists.com/elite.html',
	'http://www.freeproxylists.com/anonymous.html',
	'http://www.freeproxylists.com/non-anonymous.html',
	'http://www.freeproxylists.com/https.html',
	'http://www.freeproxylists.com/standard.html',
	'http://www.freeproxylists.com/socks.html',
];

var listDefinition = {
	link: {
		url: null,
	},
	lists: [{
		link: {
			selector: 'body > table > tbody > tr:nth-child(4) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td > table > tbody > tr:not(:first-child) > td:first-child > a',
		},
		items: [{
			selector: '#dataID > table tbody tr:nth-child(n+3)',
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
					selector: 'title',
					parse: function(anonymityLevel) {
						if (!anonymityLevel) return null;
						var match = anonymityLevel.match(/(anonymous|elite|spoiled)/i);
						if (!match || !match[1]) return null;
						switch (match[1].toLowerCase()) {
							case 'anonymous':
								return 'anonymous';
							case 'elite':
								return 'elite';
							case 'spoiled':
								return 'transparent';
						}
						return null;
					},
				},
				{
					name: 'protocols',
					selector: 'title',
					parse: function(protocols) {
						if (!protocols) return null;
						var match = protocols.match(/(ssl|socks)/i);
						if (!match || !match[1]) return null;
						switch (match[1].toLowerCase()) {
							case 'ssl':
								return ['https'];
							case 'socks':
								return ['socks4', 'socks5'];
						}
						return null;
					},
				},
			],
		}],
	}],
};

module.exports = {
	homeUrl: 'http://www.freeproxylists.com/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 10000,
	},
	config: {
		lists: _.map(startUrls, function(startUrl) {
			return _.extend({}, listDefinition, {
				link: { url: startUrl },
			});
		}),
	},
};
