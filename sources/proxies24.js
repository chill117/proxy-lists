'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var protocolToListLabel = {
	'http': 'free proxy server list',
	'https': 'free ssl proxies',
	'socks5': 'vip socks'
};

module.exports = {

	homeUrl: 'http://proxyserverlist-24.blogspot.com/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var startPages = this.prepareStartingPages(options);

		var getStartingPage = async.seq(
			this.getStartingPageHtml.bind(this),
			this.parseStartingPageHtml.bind(this)
		);

		var getList = async.seq(
			this.getListPageHtml.bind(this),
			this.parseListPageHtml.bind(this)
		);

		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](startPages, function(startingPage, nextStartingPage) {

			getStartingPage(startingPage, options, function(error, lists) {

				async[asyncMethod](lists, function(list, nextList) {

					getList(list, options, function(error, proxies) {

						if (error) {
							emitter.emit('error', error);
						} else {
							emitter.emit('data', proxies);
						}

						nextList();
					});

				}, nextStartingPage);
			});

		}, function() {
			emitter.emit('end');
		});

		return emitter;
	},

	prepareStartingPages: function(options) {

		var startingPages = [];

		if (!options.protocols || _.contains(options.protocols, 'http')) {
			startingPages.push({
				protocols: ['http'],
				url: 'http://proxyserverlist-24.blogspot.com/'
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

		return startingPages;
	},

	getStartingPageHtml: function(startingPage, options, cb) {

		options.request({
			method: 'GET',
			url: startingPage.url
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			startingPage.html = data;

			cb(null, startingPage);
		});
	},

	parseStartingPageHtml: function(startingPage, cb) {

		var found = {};
		var lists = [];
		var html = startingPage.html;
		var protocols = startingPage.protocols;

		try {

			var $ = cheerio.load(html);
			var $links = $('.post-title a');

			$links.each(function() {

				var $link = $(this);
				var label = $link.text().toString().toLowerCase();
				var protocol = _.find(protocols, function(_protocol) {
					var searchText = protocolToListLabel[_protocol] || _protocol;
					return label.indexOf(searchText) !== -1;
				});

				if (protocol && !found[protocol]) {

					var url = $link.attr('href').toString();

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

	getListPageHtml: function(list, options, cb) {

		options.request({
			method: 'GET',
			url: list.url
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			list.html = data;

			cb(null, list);
		});
	},

	parseListPageHtml: function(list, cb) {

		var html = list.html;
		var protocol = list.protocol;

		try {

			var $ = cheerio.load(html);
			var $hosts = $('pre');

			if (!($hosts.length > 0)) {
				throw new Error('Could not find hosts HTML element.');
			}

			// List of IP addresses (with port numbers):
			var hosts = $hosts
				// Get text inside HTML element:
				.text().toString()
				// Remove whitespace from beginning and end of text:
				.trim()
				// Split on each line-break:
				.split('\n');

			var proxies = _.chain(hosts).map(function(host) {
				if (host.indexOf(':') === -1) return null;
				var parts = host.split(':');
				var port = parseInt(parts[1]);
				if (_.isNaN(port)) return null;
				return {
					ipAddress: parts[0],
					port: port,
					protocols: [protocol],
				};
			}).compact().value();

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
