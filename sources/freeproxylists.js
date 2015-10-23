'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var parseString = require('xml2js').parseString;
var request = require('request');

var baseUrl = 'http://www.freeproxylists.com';

// freeproxylists uses unofficial names for some countries.
var unoffocialCountryNames = {
	'gb': 'Great Britain (UK)',
	'kr': 'Korea (South)',
	'tw': 'Taiwan',
	'us': 'United Sates',
	'vu': 'Venezuela',
};

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
					countries[unoffocialCountryNames[code] || name] = true;
				});

				proxies = _.filter(proxies, function(proxy) {
					return countries[proxy.country];
				});
			}

			cb(null, proxies);
		});
	},

	getListUrls: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		options || (options = {});

		var listUrlsByType = {};
		var startingPageUrls = {};

		if (_.indexOf(options.anonymityLevels, 'transparent') !== -1) {
			startingPageUrls.transparent = baseUrl + '/non-anonymous.html';
		}

		if (_.indexOf(options.anonymityLevels, 'anonymous') !== -1) {
			startingPageUrls.anonymous = baseUrl + '/anonymous.html';
		}

		if (_.indexOf(options.anonymityLevels, 'elite') !== -1) {
			startingPageUrls.elite = baseUrl + '/elite.html';
		}

		async.each(_.keys(startingPageUrls), function(type, next) {

			var startingPageUrl = startingPageUrls[type];

			listUrlsByType[type] = [];

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
						listUrlsByType[type].push($(this).attr('href'));
					}
				});

				next();
			});

		}, function(error) {

			if (error) {
				return cb(error);
			}

			if (options.sample) {
				listUrlsByType = _.mapObject(listUrlsByType, function(listUrls) {
					return listUrls.slice(0, 1);
				});
			}

			var listUrls = Array.prototype.concat.apply([], _.values(listUrlsByType));

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

				return next(null, data);
			});

		}, cb);
	},

	parseListData: function(listData, cb) {

		if (!_.isArray(listData)) {
			listData = [listData];
		}

		async.map(listData, function(data, next) {

			parseString(data, function(error, result) {

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
							type: $('td', tr).eq(2).text().toString() === 'true' ? 'https' : 'http',
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
