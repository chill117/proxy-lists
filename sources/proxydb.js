'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var anonymityLevelFixes = {
	'L1': 'transparent',
	'L2': 'anonymous',
	'L3': 'anonymous',
	'L4': 'elite'
};

module.exports = {

	homeUrl: 'http://proxydb.net/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getPageData = async.seq(
			this.getPageHtml,
			this.parsePageHtml
		);

		var protocols = _.reject(options.protocols, function(protocol) {
			return protocol === 'socks4';
		});

		if (options.sample) {
			protocols = protocols.slice(0, 1);
		}

		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](protocols, function(protocol, nextProtocol) {

			getPageData(protocol, 1/* page */, options, function(error, proxies, numPages) {

				if (error) {
					emitter.emit('error', error);
					return nextProtocol();
				}

				emitter.emit('data', proxies);

				if (options.sample) {
					return nextProtocol();
				}

				var asyncMethod = options.series === true ? 'timesSeries' : 'times';

				async[asyncMethod](numPages - 1, function(index, nextPage) {

					var page = index + 1;

					getPageData(protocol, page, options, function(error, proxies) {

						if (error) {
							emitter.emit('error', error);
						} else {
							emitter.emit('data', proxies);
						}

						nextPage();
					});

				}, nextProtocol);
			});

		}, function() {

			emitter.emit('end');
		});

		return emitter;
	},

	getPageHtml: function(protocol, page, options, cb) {

		var requestOptions = {
			method: 'GET',
			url: 'http://proxydb.net/',
			qs: {
				limit: 50,
				exclude_gateway: 1,
				minavail: 50,
				protocol: protocol,
				anonlvl: []
			}
		};

		if (options.sample) {
			requestOptions.qs.limit = 25;
		}

		requestOptions.qs.offset = requestOptions.qs.limit * (page - 1);

		if (_.contains(options.anonymityLevels, 'transparent')) {
			requestOptions.qs.anonlvl.push(1);
		}

		if (_.contains(options.anonymityLevels, 'anonymous')) {
			requestOptions.qs.anonlvl.push(2);
			requestOptions.qs.anonlvl.push(3);
		}

		if (_.contains(options.anonymityLevels, 'elite')) {
			requestOptions.qs.anonlvl.push(4);
		}

		request(requestOptions, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html, protocol);
		});
	},

	parsePageHtml: function(html, protocol, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);

			$('table tbody tr').each(function() {

				var $tr = $(this);
				var anonymityLevel = $tr.find('td:nth-child(8)').text().trim();

				proxies.push({
					ipAddress: $tr.find('td:nth-child(1) a').text().trim(),
					port: parseInt($tr.find('td:nth-child(2)').text().trim()),
					country: $tr.find('td:nth-child(4) abbr').text().trim().toLowerCase(),
					protocols: [protocol],
					anonymityLevel: anonymityLevelFixes[anonymityLevel] || null
				});
			});

			var numPages = $('.pagination li:last-child a').text().trim();
			numPages = numPages ? parseInt(numPages) : 0;

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies, numPages);
	}
};
