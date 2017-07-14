'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var pageUrls = _.map(_.range(1, 20), function (i) {
	var page = (i < 10)? '0' + i : i;
	return "https://premproxy.com/list/"+page+".htm";
});

module.exports = {

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromPage = this.getProxiesFromPage.bind(this);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](pageUrls, function(pageUrl, nextPage) {

			getProxiesFromPage(pageUrl, function(error, proxies) {

				if (error) {
					return nextPage(error);
				}

				if (!_.isEmpty(proxies)) {
					emitter.emit('data', proxies);
				}

				nextPage();

			});

		}, function(error) {

			if (error) {
				emitter.emit('error', error);
			}

			emitter.emit('end');
		});

		return emitter;
	},

	getProxiesFromPage: function(pageUrl, cb) {

		async.seq(
			this.getHtml.bind(this),
			this.parsePageHtml.bind(this)
		)(pageUrl, cb);
	},

	parsePageHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);
			var rows = _.tail($('table tr'));

			_.each(rows, function(row) {
				var $row = $(row);
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
	},

	getHtml: function(url, cb) {

		request({
			method: 'GET',
			url: url,
			headers: {
				'User-Agent': 'proxy-lists-module'
			}
		}, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html);
		});
	}
};
