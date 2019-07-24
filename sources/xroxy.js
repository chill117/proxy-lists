'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'anonymous': 'anonymous',
		'socks4': 'anonymous',
		'socks5': 'anonymous',
		'distorting': 'elite',
		'transparent': 'transparent',
	},
};

module.exports = {
	homeUrl: 'https://www.xroxy.com/',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'https://www.xroxy.com/free-proxy-lists/',
			},
			items: [{
				selector: '#DataTables_Table_0 > tbody > tr',
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
						selector: 'td:nth-child(3)',
						parse: function(text) {
							return convert.anonymityLevels[text.trim().toLowerCase()] || null;
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '#DataTables_Table_0_paginate > ul > li.paginate_button.active + li.paginate_button a',
				},
			},
		}],
	},
};
