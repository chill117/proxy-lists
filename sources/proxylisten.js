'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var anonymityLevelFixes = {
	'1': 'elite',
	'2': 'anonymous',
	'3': 'transparent'
};

module.exports = {

	homeUrl: 'http://www.proxy-listen.de/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromList = async.seq(
			this.getListHtml.bind(this),
			this.parseListHtml.bind(this)
		);

		this.getInfo(options, function(error, info) {

			if (error) {
				emitter.emit('error', error);
				emitter.emit('end');
				return;
			}

			var lists = [];

			// Types are protocols on proxylisten.
			var types = [];

			// Maximum number per page is 300.
			// Minimum is 50.
			var numPerPage = options.sample ? 50 : 300;

			// Additional filter parameters.
			var filters = {};

			if (_.contains(options.protocols, 'http')) {
				types.push('http');
			}

			if (_.contains(options.protocols, 'https')) {
				types.push('https');
			}

			if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {
				types.push('socks');
			}

			var anonymityLevelToFilterValue = _.invert(anonymityLevelFixes);

			_.each(types, function(type) {
				_.each(options.anonymityLevels, function(anonymityLevel) {
					lists.push({
						type: type,
						anonymityLevel: anonymityLevelToFilterValue[anonymityLevel]
					});
				});
			});

			if (options.countries && options.countries.length === 1) {
				filters.filter_country = options.countries[0];
			}

			if (options.sample) {
				// Sampling, so only get one list.
				lists = lists.slice(0, 1);
			}

			var asyncEachMethod = options.series === true ? 'eachSeries' : 'each';

			async[asyncEachMethod](lists, function(list, nextList) {

				var expectedTotal;

				if (!_.isUndefined(info.stats[list.type + '_' + list.anonymityLevel])) {
					expectedTotal = info.stats[list.type + '_' + list.anonymityLevel];
				} else {
					expectedTotal = Math.min(info.stats[list.anonymityLevel], info.stats[list.type]);
				}

				if (_.isNaN(expectedTotal)) {
					expectedTotal = numPerPage;
				}

				var numTimes = options.sample ? 1 : Math.ceil(expectedTotal / numPerPage);

				// More than 2 times is pointless because it doesn't yield any more unique proxies.
				// Pagination on proxylisten is broken.
				numTimes = Math.min(2, numTimes);

				var asyncTimesMethod = options.series === true ? 'timesSeries' : 'times';

				async[asyncTimesMethod](numTimes, function(index, nextTime) {

					var listFilters = _.extend({}, filters, {
						filter_http_anon: list.anonymityLevel
					});

					if (index > 0) {
						listFilters.next = 'next page';
					}

					getProxiesFromList(list.type, numPerPage, info.hiddenField, listFilters, options, function(error, proxies) {

						if (error) {
							emitter.emit('error', error);
						} else {
							emitter.emit('data', proxies);
						}

						nextTime();
					});

				}, nextList);

			}, function() {

				emitter.emit('end');
			});
		});

		return emitter;
	},

	/*
		Get the following:
		- Number of proxies of various types.
		- Required hidden form value.
	*/
	getInfo: function(options, cb) {

		async.seq(
			this.getInfoPageHtml,
			this.parseInfoPageHtml
		)(options, cb);
	},

	getInfoPageHtml: function(options, cb) {

		options.request({
			method: 'GET',
			url: 'http://www.proxy-listen.de/Proxy/Proxyliste.html'
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseInfoPageHtml: function(infoPageHtml, cb) {

		try {

			var info = {};
			var $ = cheerio.load(infoPageHtml);
			var $hiddenField = $('#proxyform input[type="hidden"]').eq(0);

			info.hiddenField = {
				name: $hiddenField.attr('name'),
				value: $hiddenField.attr('value')
			};

			var $stats = $('table tr', $('#leftleftonly .moduletable').eq(2));

			var totals = {
				elite: parseInt($('td', $stats.eq(0)).eq(1).text().toString()),
				anonymousHttp: parseInt($('td', $stats.eq(1)).eq(1).text().toString()),
				anonymousSsl: parseInt($('td', $stats.eq(2)).eq(1).text().toString()),
				transparentHttp: parseInt($('td', $stats.eq(3)).eq(1).text().toString()),
				socks: parseInt($('td', $stats.eq(4)).eq(1).text().toString())
			};

			info.stats = {
				elite: totals.elite,
				anonymous: totals.anonymousHttp + totals.anonymousSsl,
				transparent: totals.transparentHttp,
				http: totals.anonymousHttp + totals.transparentHttp,
				http_transparent: totals.transparentHttp,
				http_anonymous: totals.anonymousHttp,
				https: totals.anonymousSsl,
				https_anonymous: totals.anonymousSsl,
				socks: totals.socks
			};

		} catch (error) {

			return cb(error);
		}

		cb(null, info);
	},

	getListHtml: function(type, numPerPage, hiddenField, filters, options, cb) {

		var requestOptions = {
			method: 'POST',
			url: 'http://www.proxy-listen.de/Proxy/Proxyliste.html',
			headers: {
				'Origin': 'http://www.proxy-listen.de',
				'Referer': 'http://www.proxy-listen.de/Proxy/Proxyliste.html'
			},
			form: _.extend({}, filters || {}, {
				'submit': 'Show',
				'proxies': numPerPage.toString(),
				'liststyle': 'info',
				'type': type
			}),
			timeout: 3000
		};

		requestOptions.form[hiddenField.name] = hiddenField.value;

		options.request(requestOptions, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data, type);
		});
	},

	parseListHtml: function(listHtml, type, cb) {

		var protocols;

		if (type === 'httphttps') {
			protocols = ['http', 'https'];
		} else {
			protocols = [type];
		}

		try {

			var proxies = [];
			var $ = cheerio.load(listHtml);

			$('table.proxyList tr').each(function(index, tr) {

				if (!index) {
					// Skip the first row.
					return;
				}

				var $cells = $('td', tr);
				var ipAddress = $cells.eq(0).text().toString();
				var port = parseInt($cells.eq(1).text().toString());
				var anonymityLevel = $cells.eq(3).text().toString();

				var proxy = {
					ipAddress: ipAddress,
					port: port,
					protocols: protocols
				};

				if (anonymityLevel && anonymityLevelFixes[anonymityLevel]) {
					proxy.anonymityLevel = anonymityLevelFixes[anonymityLevel];
				}

				proxies.push(proxy);
			});

		} catch (error) {

			return cb(error);
		}

		cb(null, proxies);
	}
};
