'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var protocolToListLabel = {
	'socks4/5': 'socks'
};

module.exports = {

	homeUrl: 'http://www.proxyocean.com/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getStartingPage = async.seq(
			this.getStartingPageHtml,
			this.parseStartingPageHtml
		);

		var getList = async.seq(
			this.getListPageHtml,
			this.parseListPageHtml
		);

		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		getStartingPage(function(error, lists) {

			if (error) {
				emitter.emit('error', error);
				return emitter.emit('end');
			}

			async[asyncMethod](lists, function(list, nextList) {

				getList(list, function(error, proxies) {

					if (error) {
						emitter.emit('error', error);
					} else {
						emitter.emit('data', proxies);
					}

					nextList();
				});

			}, function() {

				emitter.emit('end');
			});
		});

		return emitter;
	},

	getStartingPageHtml: function(cb) {

		request({
			method: 'GET',
			url: module.exports.homeUrl
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseStartingPageHtml: function(html, cb) {

		var found = {};
		var lists = [];
		var html = html;
		var protocols = _.keys(protocolToListLabel);

		try {

			var $ = cheerio.load(html);

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

	getListPageHtml: function(list, cb) {

		request({
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

		var proxies = [];
		var html = list.html;
		var protocol = list.protocol;

		try {

			var $ = cheerio.load(html);

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
						ipAddress: host[0],
						port: parseInt(host[1]),
						protocols: protocol === 'socks4/5' ? ['socks4', 'socks5'] : [protocol]
					});
				}
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
