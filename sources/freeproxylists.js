'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var request = require('request');

var baseUrl = 'http://www.freeproxylists.com';

var countries = require('../countries');

// freeproxylists uses unofficial names for some countries.
var unoffocialCountryNames = {
	'gb': 'Great Britain (UK)',
	'ir': 'Iran',
	'kr': 'Korea (South)',
	'md': 'Moldova',
	'tw': 'Taiwan',
	'us': 'United States',
	'vu': 'Venezuela',
};

var countryNameToCode = _.invert(_.extend({}, countries, unoffocialCountryNames));

var Source = module.exports = {

	homeUrl: baseUrl,

	getProxies: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		var fn = async.seq(
			this.getListUrls,
			this.getListData,
			this.parseListData
		);

		fn(options, function(error, proxies) {

			if (options.countries) {

				var countries = {};

				_.each(options.countries, function(name, code) {
					countries[unoffocialCountryNames[code] || name] = code;
				});

				proxies = _.filter(proxies, function(proxy) {
					return !!countries[proxy.country];
				});
			}

			proxies = _.map(proxies, function(proxy) {
				proxy.port = parseInt(proxy.port);
				proxy.country = countryNameToCode[proxy.country] || proxy.country;
				return proxy;
			});

			cb(null, proxies);
		});
	},

	getListUrls: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		options || (options = {});

		var listUrlsByPage = {};
		var startingPageUrls = {};

		if (_.contains(options.types, 'http') || _.contains(options.types, 'https')) {

			if (_.contains(options.anonymityLevels, 'transparent')) {
				startingPageUrls.transparent = baseUrl + '/non-anonymous.html';
			}

			if (_.contains(options.anonymityLevels, 'anonymous')) {
				startingPageUrls.anonymous = baseUrl + '/anonymous.html';
			}

			if (_.contains(options.anonymityLevels, 'elite')) {
				startingPageUrls.elite = baseUrl + '/elite.html';
			}
		}

		if (_.contains(options.types, 'socks4') || _.contains(options.types, 'socks5')) {
			startingPageUrls.socks = baseUrl + '/socks.html';
		}

		async.each(_.keys(startingPageUrls), function(page, next) {

			var startingPageUrl = startingPageUrls[page];

			listUrlsByPage[page] = [];

			request({
				method: 'GET',
				url: startingPageUrl
			}, function(error, response, data) {

				if (error) {
					return next(error);
				}

				var $ = cheerio.load(data);

				$('table a').each(function(index) {

					var text = $(this).text();

					if (text && text.substr(0, 'detailed list #'.length) === 'detailed list #') {
						listUrlsByPage[page].push($(this).attr('href'));
					}
				});

				next();
			});

		}, function(error) {

			if (error) {
				return cb(error);
			}

			if (options.sample) {
				// When sampling, get keep one list URL for each starting page.
				listUrlsByPage = _.mapObject(listUrlsByPage, function(listUrls) {
					return listUrls.slice(0, 1);
				});
			}

			var listUrls = Array.prototype.concat.apply([], _.values(listUrlsByPage));

			cb(null, listUrls);
		});
	},

	getListData: function(listUrls, cb) {

		async.map(listUrls, function(listUrl, next) {

			var dataUrl = Source.listUrlToDataUrl(listUrl);

			request({
				method: 'GET',
				url: dataUrl
			}, function(error, response, data) {

				if (error) {
					return next(error);
				}

				var list = {
					url: listUrl,
					data: data
				};

				return next(null, list);
			});

		}, cb);
	},

	parseListData: function(listData, cb) {

		if (!_.isArray(listData)) {
			listData = [listData];
		}

		async.map(listData, function(list, next) {

			var type;

			if (list.url.substr(0, 'socks/'.length) === 'socks/') {
				type = 'socks4/5';
			}

			parseString(list.data, function(error, result) {

				if (error) {
					return next(error);
				}

				var proxies = [];
				var html = result.root.quote[0];
				var $ = cheerio.load(html);

				$('table tr').each(function(index, tr) {

					if (index > 1) {

						// Data starts at the 3rd row.

						proxies.push({
							ip_address: $('td', tr).eq(0).text().toString(),
							port: $('td', tr).eq(1).text().toString(),
							type: type || ($('td', tr).eq(2).text().toString() === 'true' ? 'https' : 'http'),
							country: $('td', tr).eq(5).text().toString()
						});
					}
				});

				next(null, proxies);
			});

		}, function(error, parsed) {

			if (error) {
				return cb(error);
			}

			var proxies = Array.prototype.concat.apply([], parsed);

			cb(null, proxies);
		});
	},

	listUrlToDataUrl: function(listUrl) {

		var parts = listUrl.split('/');

		return baseUrl + '/load_' + parts[0] + '_' + parts[1];
	}
};
