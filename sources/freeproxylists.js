'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var parseXml = require('xml2js').parseString;

var baseUrl = 'http://www.freeproxylists.com';

var Source = module.exports = {

	homeUrl: baseUrl,

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();
		var startingPageUrls = this.prepareStartingPageUrls(options);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		var getStartingPage = async.seq(
			this.getStartingPageHtml.bind(this),
			this.parseStartingPageHtml.bind(this)
		);

		var getList = async.seq(
			this.getListData.bind(this),
			this.parseListData.bind(this)
		);

		async[asyncMethod](_.keys(startingPageUrls), function(key, nextStartingPage) {

			var startingPageUrl = startingPageUrls[key];

			getStartingPage(startingPageUrl, options, function(error, listUrls) {

				if (error) {
					emitter.emit('error', error);
					return nextStartingPage();
				}

				if (options.sample) {
					// When sampling, only use one list URL.
					listUrls = listUrls.slice(0, 1);
				}

				async[asyncMethod](listUrls, function(listUrl, nextList) {

					getList(listUrl, options, function(error, proxies) {

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

	prepareStartingPageUrls: function(options) {

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

		if (options.sample) {
			// When sampling, only use one URL.
			startingPageUrls = _.pick(startingPageUrls, _.first(_.keys(startingPageUrls)));
		}

		return startingPageUrls;
	},

	getStartingPageHtml: function(startingPageUrl, options, cb) {

		options.request({
			method: 'GET',
			url: startingPageUrl
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseStartingPageHtml: function(startingPageHtml, cb) {

		try {

			var listUrls = [];
			var $ = cheerio.load(startingPageHtml);

			$('table a').each(function() {

				var text = $(this).text();

				if (text && text.substr(0, 'detailed list #'.length) === 'detailed list #') {
					listUrls.push($(this).attr('href'));
				}
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, listUrls);
	},

	getListData: function(listUrl, options, cb) {

		var dataUrl = Source.listUrlToDataUrl(listUrl);

		options.request({
			method: 'GET',
			url: dataUrl
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data, listUrl);
		});
	},

	parseListData: function(data, listUrl, cb) {

		var list = {
			url: listUrl,
			data: data
		};

		if (list.url.substr(0, 'socks/'.length) === 'socks/') {
			list.protocol = 'socks5';
			list.anonymityLevel = 'anonymous';
		} else if (list.url.substr(0, 'nonanon/'.length) === 'nonanon/') {
			list.anonymityLevel = 'transparent';
		} else if (list.url.substr(0, 'anon/'.length) === 'anon/') {
			list.anonymityLevel = 'anonymous';
		} else if (list.url.substr(0, 'elite/'.length) === 'elite/') {
			list.anonymityLevel = 'elite';
		}

		parseXml(list.data, function(error, result) {

			if (error) {
				return cb(error);
			}

			try {

				var proxies = [];
				var $ = cheerio.load(result.root.quote[0]);

				$('table tr').each(function(index, tr) {

					if (index > 1) {

						// Data starts at the 3rd row.

						var protocol = list.protocol;

						if (!protocol) {
							protocol = $('td', tr).eq(2).text().toString() === 'true' ? 'https' : 'http';
						}

						proxies.push({
							ipAddress: $('td', tr).eq(0).text().toString(),
							port: parseInt($('td', tr).eq(1).text().toString()),
							protocols: [protocol],
							anonymityLevel: list.anonymityLevel
						});
					}
				});

			} catch (error) {
				return cb(error);
			}

			cb(null, proxies);
		});
	},

	listUrlToDataUrl: function(listUrl) {

		var parts = listUrl.split('/');

		return baseUrl + '/load_' + parts[0] + '_' + parts[1];
	}
};
