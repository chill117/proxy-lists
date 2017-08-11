'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

module.exports = {

	homeUrl: 'https://premproxy.com/list/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();
		var getProxiesFromPage = this.getProxiesFromPage.bind(this);
		var pageNumber = 1;
		var done = false;

		// Until runs in series.
		async.until(function() { return done; }, function(next) {
			getProxiesFromPage(pageNumber++, options, function(error, proxies) {

				if (error) {
					emitter.emit('error', error);
				} else if (!_.isEmpty(proxies)) {
					emitter.emit('data', proxies);
				} else {
					done = true;
				}

				if (options.sample) {
					// Only get one page when sampling.
					done = true;
				}

				next();
			});
		}, function() {
			emitter.emit('end');
		});

		return emitter;
	},

	getProxiesFromPage: function(pageNumber, options, cb) {

		var pageUrl = this.makePageUrl(pageNumber);
		var parsePageHtml = this.parsePageHtml.bind(this);

		options.request({
			method: 'GET',
			url: pageUrl,
			headers: {
				'User-Agent': 'proxy-lists-module'
			}
		}, function(error, response, body) {

			if (error) {
				return cb(error);
			}

			if (response.statusCode >= 300) {
				return cb(null, []/* proxies */);
			}

			parsePageHtml(body.toString(), cb);
		});
	},

	makePageUrl: function(pageNumber) {

		var pageUrl = 'https://premproxy.com/list/';
		if (pageNumber < 10) {
			// Left pad when page number is single digit.
			pageUrl += '0';
		}
		pageUrl += pageNumber + '.htm';
		return pageUrl;
	},

	parsePageHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);

			$('table tr')
				// Skip the first row:
				.slice(1)
				.each(function(index, tr) {
					var $row = $(tr);
					var host = $row.find('td:nth-child(1)').text().trim().split(':');
					var anonymityLevel = $row.find('td:nth-child(2)').text().trim();
					proxies.push({
						ipAddress: host[0],
						port: parseInt(host[1]),
						anonymityLevel: anonymityLevel,
						protocols: ['http']
					});
				});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
