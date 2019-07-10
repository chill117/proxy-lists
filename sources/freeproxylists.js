'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://www.freeproxylists.com/',
	abstract: 'list-crawler',
	defaultOptions: {},
	config: {
		startUrls: [
			'http://www.freeproxylists.com/elite.html',
			'http://www.freeproxylists.com/anonymous.html',
			'http://www.freeproxylists.com/non-anonymous.html',
			'http://www.freeproxylists.com/https.html',
			'http://www.freeproxylists.com/standard.html',
			'http://www.freeproxylists.com/socks.html',
		],
		listLinks: [
			'body > table > tbody > tr:nth-child(4) > td:nth-child(3) > table > tbody > tr:nth-child(2) > td table > tbody > tr:not(:first-child) > td:first-child > a',
		],
		items: {
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
			],
		},
	},
};
