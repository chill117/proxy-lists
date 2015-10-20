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

		Source.getListUrls(function(error, listUrls) {

			if (error) {
				return cb(error);
			}

			async.map(Source.listUrls, Source.getListData, function(error, listData) {

				if (error) {
					return cb(error);
				}

				var proxies = Array.prototype.concat.apply([], listData);

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
		});
	},

	getListData: function(listUrl, cb) {

		var dataUrl = Source.listUrlToDataUrl(listUrl);

		request({
			method: 'GET',
			url: dataUrl
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			Source.parseListData(data, cb);
		});
	},

	parseListData: function(data, cb) {

		var proxies = [];

		parseString(data, function(error, result) {

			if (error) {
				return cb(error);
			}

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

			cb(null, proxies);
		});
	},

	listUrlToDataUrl: function(listUrl) {

		var parts = listUrl.split('/');

		return baseUrl + '/load_' + parts[0] + '_' + parts[1];
	},

	getListUrls: function(cb) {

		var listUrls = [];

		var startingPageUrls = [
			baseUrl + '/elite.html',
			baseUrl + '/anonymous.html'
		];

		async.each(startingPageUrls, function(url, next) {

			request({
				method: 'GET',
				url: url
			}, function(error, response, data) {

				if (error) {
					return next(error);
				}

				var $ = cheerio.load(data);

				$('table a').each(function(index) {

					var text = $(this).text();

					if (text && text.substr(0, 'detailed list #'.length) === 'detailed list #') {
						listUrls.push($(this).attr('href'));
					}
				});

				next();
			});

		}, function(error) {

			if (error) {
				return cb(error);
			}

			cb(null, listUrls);
		});
	}
};
