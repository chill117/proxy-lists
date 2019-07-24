'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'https://proxy50-50.blogspot.com/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'https://proxy50-50.blogspot.com/',
			},
			items: [{
				selector: '.post-outer .post table tr:not(:first-child)',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'td:nth-child(2)',
					},
					{
						name: 'port',
						selector: 'td:nth-child(3)',
						parse: function(text) {
							var port = parseInt(text);
							if (_.isNaN(port)) return null;
							return port;
						},
					},
				],
			}],
		}],
	},
};
