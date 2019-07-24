'use strict';

var _ = require('underscore');

var convert = {
	protocols: {
		'4': ['socks4'],
		'5': ['socks5'],
		'4/5': ['socks4', 'socks5'],
	},
};

module.exports = {
	homeUrl: 'https://sockslist.net/',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'https://sockslist.net/proxy/server-socks-hide-ip-address',
			},
			items: [{
				selector: '.proxytbl tbody tr:not(:first-child)',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(1)',
					},
					{
						name: 'port',
						selector: 'td:nth-child(2)',
						parse: function(port) {
							if (!port) return null;
							var match = port.trim().match(/([0-9]+)$/);
							if (!match || !match[1]) return null;
							port = parseInt(match[1]);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'protocols',
						selector: 'td:nth-child(4)',
						parse: function(text) {
							if (!text) return null;
							return convert.protocols[text.trim()] || [];
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#pages .current + a',
				},
			},
		}],
	},
};
