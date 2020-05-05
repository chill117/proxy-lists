'use strict';

var _ = require('underscore');

var lists = [
	{
		selector: '#free-proxy-list > div:nth-of-type(2)',
		protocols: ['http', 'https'],
	},
	{
		selector: '#free-proxy-list > div:nth-of-type(4)',
		protocols: ['socks4'],
	},
	{
		selector: '#free-proxy-list > div:nth-of-type(6)',
		protocols: ['socks5'],
	},
];

module.exports = {
	homeUrl: 'https://proxy-daily.com/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'https://proxy-daily.com/',
			},
			items: _.map(lists, function (list) {
				return {
					selector: list.selector,
					parse: function (text) {
						return _.chain(text.trim().split('\n'))
							.map(function (item) {
								var match = item.trim().match(/^([0-9.]+):([0-9]+)/);
								if (!match || !match[1] || !match[2]) return null;
								return {
									ipAddress: match[1],
									port: match[2],
									protocols: list.protocols,
								};
							})
							.compact()
							.value();
					},
				};
			}),
		}],
	},
};
