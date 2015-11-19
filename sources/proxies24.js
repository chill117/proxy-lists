'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var GeoIpNativeLite = require('geoip-native-lite');
var request = require('request');

var protocolToListLabel = {
	'http': 'free proxy server list',
	'https': 'free ssl proxies',
	'socks5': 'vip socks'
};

var proxies24 = module.exports = {

	homeUrl: 'http://proxyserverlist-24.blogspot.com/',

	getProxies: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		var fn = async.seq(
			proxies24.getStartingPages,
			proxies24.getLists,
			proxies24.getListPagesHtml,
			proxies24.parseListPagesHtml,
			proxies24.geoLocate
		);

		fn(options, cb);
	},

	getStartingPages: function(options, cb) {

		var startingPages = [];

		if (_.contains(options.protocols, 'socks5')) {
			startingPages.push({
				protocols: ['socks5'],
				url: 'http://vip-socks24.blogspot.com/'
			});
		}

		if (_.contains(options.protocols, 'http')) {
			startingPages.push({
				protocols: ['http'],
				url: 'http://proxyserverlist-24.blogspot.com/'
			});
		}

		if (_.contains(options.protocols, 'https')) {
			startingPages.push({
				protocols: ['https'],
				url: 'http://sslproxies24.blogspot.com/'
			});
		}

		if (options.sample) {

			// When sampling, use only one starting page URL.
			startingPages = startingPages.slice(0, 1);

			startingPages = _.map(startingPages, function(startingPage) {
				// Use only one protocol.
				startingPage.protocols = startingPage.protocols.slice(0, 1);
				return startingPage;
			});
		}

		cb(null, startingPages);
	},

	getLists: function(startingPages, cb) {

		async.map(startingPages, function(startingPage, next) {

			request({
				method: 'GET',
				url: startingPage.url
			}, function(error, response, data) {

				if (error) {
					return next(error);
				}

				proxies24.parseStartingPageHtmlForLists(data, startingPage.protocols, next);
			});

		}, function(error, lists) {

			if (error) {
				return cb(error);
			}

			// Collapse to a flat array.
			lists = Array.prototype.concat.apply([], lists);

			cb(null, lists);
		});
	},

	parseStartingPageHtmlForLists: function(startingPageHtml, protocols, cb) {

		var found = {};
		var lists = [];

		try {

			var $ = cheerio.load(startingPageHtml);

			$('.post-title a').each(function(i, anchor) {

				var $anchor = $(this);
				var label = $anchor.text().toString().toLowerCase();
				var protocol = _.find(protocols, function(_protocol) {
					var searchText = protocolToListLabel[_protocol] || _protocol;
					return label.indexOf(searchText) !== -1;
				});

				if (protocol && !found[protocol]) {

					var url = $anchor.attr('href').toString();

					lists.push({
						url: url,
						protocol: protocol
					});

					found[protocol] = true;
				}
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, lists);
	},

	getListPagesHtml: function(lists, cb) {

		async.map(lists, function(list, next) {

			request({
				method: 'GET',
				url: list.url
			}, function(error, response, data) {

				if (error) {
					return next(error);
				}

				list.html = data;

				next(null, list);

			});

		}, cb);
	},

	parseListPagesHtml: function(lists, cb) {

		async.map(lists, function(list, next) {

			proxies24.parseListPageHtml(list.html, list.protocol, next);

		}, function(error, proxies) {

			if (error) {
				return cb(error);
			}

			// Collapse to a flat array.
			proxies = Array.prototype.concat.apply([], proxies);

			cb(null, proxies);
		});
	},

	parseListPageHtml: function(listPageHtml, protocol, cb) {

		var proxies = [];

		try {

			var $ = cheerio.load(listPageHtml);

			var hostsElSelectors = [
				'.post-body textarea',
				'.post-body pre span span:nth-child(2)',
				'.post-body pre span span:nth-child(1)'
			];

			var $hostsEl;
			var hostsElSelector;

			while (hostsElSelectors.length > 0 && (!$hostsEl || !($hostsEl.length > 0))) {
				hostsElSelector = hostsElSelectors.shift();
				$hostsEl = $(hostsElSelector);
			}

			if (!$hostsEl || !($hostsEl.length > 0)) {
				return cb(new Error('Could not find hosts HTML element.'));
			}

			// List of IP addresses (with port numbers):
			var hosts = $hostsEl
				// Get text inside HTML element:
				.text().toString()
				// Remove whitespace from beginning and end of text:
				.trim()
				// Split on each line-break:
				.split('\n');

			var proxies = [];

			_.each(hosts, function(host) {

				host = host.split(':');

				if (host[0] && host[1]) {
					proxies.push({
						ip_address: host[0],
						port: parseInt(host[1]),
						protocol: protocol
					});
				}
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	},

	geoLocate: function(proxies, cb) {

		GeoIpNativeLite.loadData(function(error) {

			if (error) {
				return cb(error);
			}

			var geoLocated = [];

			_.each(proxies, function(proxy) {

				var country = GeoIpNativeLite.lookup(proxy.ip_address);

				if (country) {
					proxy.country = country;
					geoLocated.push(proxy);
				}
			});

			cb(null, geoLocated);
		});
	}
};
