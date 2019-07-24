'use strict';

var _ = require('underscore');

var startUrls = [
	'https://www.blackhatworld.com/seo/100-scrapebox-proxies.297574/',
	'https://www.blackhatworld.com/seo/gscraper-proxies.703493/',
	'https://www.blackhatworld.com/seo/port-scanned-proxies.988868/',
	'https://www.blackhatworld.com/seo/gsa-proxies-proxygo.830325/',
	'https://www.blackhatworld.com/seo/socks-proxies-occasional-update.803039/',
	'https://www.blackhatworld.com/seo/ssl-proxies-occasional-update.927669/',
	'https://www.blackhatworld.com/seo/anonymous-proxies.806981/',
	'https://www.blackhatworld.com/seo/tunnel-connect-proxies.951125/',
];

var listDefinition = {
	// Each list will have its own start URL.
	link: { url: null },
	lists: [{
		link: {
			selector: '.PageNav nav .PageNavNext + a',
		},
		items: [{
			selector: [
				'li.message:last-child > div.messageInfo.primaryContent pre',
				'li.message:nth-last-child(2) > div.messageInfo.primaryContent pre',
				'li.message:nth-last-child(3) > div.messageInfo.primaryContent pre',
				'li.message:nth-last-child(4) > div.messageInfo.primaryContent pre',
				'li.message:nth-last-child(5) > div.messageInfo.primaryContent pre',
			].join(','),
			parse: function(text) {
				return text.trim().split('\n').map(function(item) {
					var match = item.trim().match(/^([0-9.]+):([0-9]+)/);
					if (!match || !match[1] || !match[2]) return null;
					var ipAddress = match[1];
					var port = parseInt(match[2]);
					if (_.isNaN(port)) return null;
					return {
						ipAddress: ipAddress,
						port: port,
					};
				}).filter(Boolean);
			},
		}],
	}],
};

module.exports = {
	homeUrl: 'https://www.blackhatworld.com',
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
