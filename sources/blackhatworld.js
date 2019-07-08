'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://www.blackhatworld.com',
	abstract: 'list-crawler',
	defaultOptions: {},
	config: {
		startUrls: [
			'https://www.blackhatworld.com/seo/100-scrapebox-proxies.297574/',
			'https://www.blackhatworld.com/seo/gscraper-proxies.703493/',
			'https://www.blackhatworld.com/seo/port-scanned-proxies.988868/',
			'https://www.blackhatworld.com/seo/gsa-proxies-proxygo.830325/',
			'https://www.blackhatworld.com/seo/socks-proxies-occasional-update.803039/',
			'https://www.blackhatworld.com/seo/ssl-proxies-occasional-update.927669/',
			'https://www.blackhatworld.com/seo/anonymous-proxies.806981/',
			'https://www.blackhatworld.com/seo/tunnel-connect-proxies.951125/',
		],
		listLinks: [
			'.PageNav nav .PageNavNext + a',
		],
		list: {
			selector: 'li.message:last-child > div.messageInfo.primaryContent pre',
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
		},
	},
};
