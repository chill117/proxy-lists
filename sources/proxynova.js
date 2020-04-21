'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://www.proxynova.com/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'https://www.proxynova.com/proxy-server-list/',
			},
			items: [{
				selector: '#tbl_proxy_list tbody tr',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
						parse: function(text) {
							if (!text) return null;
							var match = text.match(/\);(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
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
						selector: 'td:nth-child(7)',
						parse: function(anonymityLevel) {
							if (!anonymityLevel) return null;
							return anonymityLevel.trim().toLowerCase();
						},
					},
				],
			}],
		}],
	},
};
