'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var anonymityLevelFixes = {
	'No': 'transparent',
	'Low': 'transparent',
	'Medium': 'anonymous',
	'High': 'elite'
};

var convertProtocols = {
	'http': 'h',
	'https': 's',
	'socks4': '4',
	'socks5': '5'
};

var convertAnonymityLevels = {
	'transparent': 12,
	'anonymous': 3,
	'elite': 4
};

module.exports = {

	homeUrl: 'https://incloak.com/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getPageData = async.seq(
			this.getPageHtml.bind(this),
			this.parsePageHtml.bind(this)
		);

		var done = _.once(function(error) {

			if (error) {
				emitter.emit('error', error);
			}

			emitter.emit('end');
		});

		getPageData(1/* page */, options, function(error, proxies, numPages) {

			if (error) {
				return done(error);
			}

			emitter.emit('data', proxies);

			if (options.sample) {
				return done();
			}

			var asyncMethod = options.series === true ? 'timesSeries' : 'times';

			async[asyncMethod](numPages - 1, function(index, nextPage) {

				var page = index + 1;

				getPageData(page, options, function(error, proxies) {

					if (error) {
						emitter.emit('error', error);
					} else {
						emitter.emit('data', proxies);
					}

					nextPage();
				});

			}, done);
		});

		return emitter;
	},

	getPageHtml: function(page, options, cb) {

		var itemsPerPage = 64;

		var requestOptions = {
			method: 'GET',
			url: 'https://incloak.com/proxy-list/',
			headers: {
				'User-Agent': 'request'
			},
			qs: {
				start: (page - 1) * itemsPerPage
			}
		};

		if (!_.isEmpty(options.protocols)) {
			requestOptions.qs.type = _.map(options.protocols, function(protocol) {
				return convertProtocols[protocol];
			}).join('');
		}

		if (!_.isEmpty(options.anonymityLevels)) {
			requestOptions.qs.anon = _.map(options.anonymityLevels, function(anonymityLevel) {
				return convertAnonymityLevels[anonymityLevel];
			}).join('');
		}

		// Cannot use country filter, because it flags the request as a "bot".

		options.request(requestOptions, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html);
		});
	},

	parsePageHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);

			$('table.proxy__t tbody tr').each(function() {

				var $tr = $(this);
				var anonymityLevel = $tr.find('td:nth-child(6)').text().trim();

				var proxy = {
					ipAddress: $tr.find('td:nth-child(1)').text().trim(),
					port: parseInt($tr.find('td:nth-child(2)').text().trim()),
					protocols: _.map($tr.find('td:nth-child(5)').text().split(','), function(protocol) {
						return protocol.toLowerCase().trim();
					})
				};

				if (anonymityLevel && anonymityLevelFixes[anonymityLevel]) {
					proxy.anonymityLevel = anonymityLevelFixes[anonymityLevel];
				}

				proxies.push(proxy);
			});

			var numPages = $('.proxy__pagination li:last-child a').text().trim();
			numPages = numPages ? parseInt(numPages) : 1;

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies, numPages);
	}
};
