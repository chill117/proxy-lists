'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events');
var request = require('request');

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
			this.getListHtml,
			this.parseListHtml
		);

		this.getInfo(function(error, info) {

			if (error) {
				emitter.emit('error', error);
				emitter.emit('end');
				return;
			}

			var types = [];
			var numPerPage = options.sample ? 50 : 300;
			var filters = {};
			var getHttp = _.contains(options.protocols, 'http');
			var getHttps = _.contains(options.protocols, 'https');

			if (getHttp && getHttps) {
				types.push('httphttps');
			} else if (getHttp) {
				types.push('http');
			} else if (getHttps) {
				types.push('https');
			}

			if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {
				types.push('socks');
			}

			if (options.anonymityLevels.length === 1) {
				filters.filter_http_anon = options.anonymityLevels[0];
			}

			if (options.countries.length === 1) {
				filters.filter_country = options.countries[0];
			}

			if (options.sample) {
				// Sampling, so only get one type.
				types = types.slice(0, 1);
			}

			var asyncEachMethod = options.series === true ? 'eachSeries' : 'each';

			async[asyncEachMethod](types, function(type, nextType) {

				var expectedTotal;

				switch (type) {

					case 'http':
						expectedTotal = info.stats.http;
					break;

					case 'https':
						expectedTotal = info.stats.https;
					break;

					case 'httphttps':
						expectedTotal = info.stats.http + info.stats.https;
					break;

					case 'socks':
						expectedTotal = info.stats.socks;
					break;
				}

				var numTimes = options.sample ? 1 : Math.ceil(expectedTotal / numPerPage);
				var asyncTimesMethod = options.series === true ? 'timesSeries' : 'times';

				async[asyncTimesMethod](numTimes, function(index, nextTime) {

					getProxiesFromList(type, numPerPage, info.hiddenField, filters, function(error, proxies) {

						if (error) {
							emitter.emit('error', error);
						} else {
							emitter.emit('data', proxies);
						}

						nextTime();
					});

				}, nextType);

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
	getInfo: function(cb) {

		var fn = async.seq(
			this.getInfoPageHtml,
			this.parseInfoPageHtml
		);

		fn(cb);
	},

	getInfoPageHtml: function(cb) {

		request({
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
				http: totals.transparentHttp + totals.transparentHttp,
				https: totals.anonymousSsl,
				socks: totals.socks
			};

		} catch (error) {

			return cb(error);
		}

		cb(null, info);
	},

	getListHtml: function(type, numPerPage, hiddenField, filters, cb) {

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
			})
		};

		requestOptions.form[hiddenField.name] = hiddenField.value;

		request(requestOptions, function(error, response, data) {

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
				var countryImgSrc = $cells.eq(5).find('img').eq(0).attr('src');
				var country = countryImgSrc && countryImgSrc.match(/\/([a-z]{2,2})\.png/)[1] || null;

				proxies.push({
					ipAddress: ipAddress,
					port: port,
					protocols: protocols,
					anonymityLevel: anonymityLevelFixes[anonymityLevel] || null,
					country: country
				});
			});

		} catch (error) {

			return cb(error);
		}

		cb(null, proxies);
	}
};
