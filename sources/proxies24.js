'use strict';

var _ = require('underscore');

var linkSelectors = [
	'.post-title a',
	'#Feed1_feedItemListDisplay .item-title a',
	'#Feed2_feedItemListDisplay .item-title a',
];

var subListDefinition = {
	// Each sub-list will have its own link selector.
	link: { selector: null },
	items: [{
		selector: '.post pre, .post textarea',
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
	homeUrl: 'http://www.proxyserverlist24.top/',
	abstract: 'list-crawler',
	defaultOptions: {
		defaultTimeout: 5000,
	},
	config: {
		lists: [{
			link: {
				url: 'http://www.proxyserverlist24.top/',
			},
			lists: _.map(linkSelectors, function(linkSelector) {
				return _.extend({}, subListDefinition, {
					link: { selector: linkSelector },
				});
			}),
		}],
	},
};
