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
	'bo': 'Bolivia',
	'ci': 'Cote D\'Ivoire (Ivory Coast)',
	'hr': 'Croatia (Hrvatska)',
	'gb': 'Great Britain (UK)',
	'ir': 'Iran',
	'kr': 'Korea (South)',
	'la': 'Laos',
	'mk': 'Macedonia',
	'md': 'Moldova',
	'nz': 'New Zealand (Aotearoa)',
	'ps': 'Palestine',
	'sk': 'Slovak Republic',
	'sy': 'Syria',
	'tw': 'Taiwan',
	'tz': 'Tanzania',
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

		fn(options, cb);
	},

	getListUrls: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		options || (options = {});

		var listUrlsByPage = {};
		var startingPageUrls = Source.getStartingPageUrls(options);
		var pages = _.keys(startingPageUrls);

		if (options.sample) {
			// When sampling, only use one of the starting pages.
			pages = [_.first(pages)];
		}

		async.each(pages, function(page, next) {

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

	getStartingPageUrls: function(options) {

		var startingPageUrls = {};

		if (_.contains(options.protocols, 'http') || _.contains(options.protocols, 'https')) {

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

		if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {
			startingPageUrls.socks = baseUrl + '/socks.html';
		}

		return startingPageUrls;
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

			var protocol;
			var anonymityLevel;

			if (list.url.substr(0, 'socks/'.length) === 'socks/') {
				protocol = 'socks4/5';
				anonymityLevel = 'anonymous';
			} else if (list.url.substr(0, 'nonanon/'.length) === 'nonanon/') {
				anonymityLevel = 'transparent';
			} else if (list.url.substr(0, 'anon/'.length) === 'anon/') {
				anonymityLevel = 'anonymous';
			} else if (list.url.substr(0, 'elite/'.length) === 'elite/') {
				anonymityLevel = 'elite';
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

						var countryName = $('td', tr).eq(5).text().toString();
						var countryCode = countryNameToCode[countryName] || null;

						if (countryCode) {

							proxies.push({
								ip_address: $('td', tr).eq(0).text().toString(),
								port: parseInt($('td', tr).eq(1).text().toString()),
								protocol: protocol || ($('td', tr).eq(2).text().toString() === 'true' ? 'https' : 'http'),
								country: countryCode,
								anonymityLevel: anonymityLevel
							});
						}
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
