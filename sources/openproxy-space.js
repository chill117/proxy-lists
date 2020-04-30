'use strict';

var _ = require('underscore');

var subListLinkSelectors = [
	'.lists a.list:nth-child(1)',
	'.lists a.list:nth-child(2)',
	'.lists a.list:nth-child(3)',
];

var subListDefinition = {
	link: {
		// Each sub-list will have its own link selector.
		selector: null,
	},
	items: [{
		selector: '.data textarea',
		parse: function(text) {
			return _.chain(text.trim().split('\n')).map(function(item) {
				var match = item.trim().match(/^([0-9.]+):([0-9]+)/);
				if (!match || !match[1] || !match[2]) return null;
				return {
					ipAddress: match[1],
					port: match[2],
				};
			}).compact().value();
		},
	}],
};

module.exports = {
	homeUrl: 'https://openproxy.space',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: { url: 'https://openproxy.space/list' },
			lists: _.map(subListLinkSelectors, function(selector) {
				return _.extend({}, subListDefinition, {
					link: {
						evaluate: {
							fn: function() {
								window.scrollBy(0, 202);
							},
						},
						selector: selector,
					},
				});
			}),
		}],
	},
};
