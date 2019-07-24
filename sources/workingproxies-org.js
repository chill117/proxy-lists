'use strict';

var _ = require('underscore');

module.exports = {
	homeUrl: 'http://www.workingproxies.org/',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'http://www.workingproxies.org/',
			},
			items: [{
				selector: '.proxies tbody tr:not(:last-child)',
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
			}],
			pagination: {
				next: {
					selector: '.paginator .page.current + .page:not(.current) a',
				},
			},
		}],
	},
};
