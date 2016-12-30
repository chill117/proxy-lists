'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var numberPagesOfProxiesToGet = 2;

module.exports = {

	homeUrl: 'http://maxiproxies.com/proxy-lists/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromPage = async.seq(this.getHtml, this.parsePageHtml);

		this.getPageUrls(function(error, urls) {

			if (error) {
				emitter.emit('error', error);
				return emitter.emit('end');
			}

			var asyncMethod = options.series === true ? 'eachSeries' : 'each';

			async[asyncMethod](urls, function(url, nextUrl) {

				getProxiesFromPage(url, function(error, proxies) {

					if (error) {
						return nextUrl(error);
					}

					if (!_.isEmpty(proxies)) {
						emitter.emit('data', proxies);
					}

					nextUrl();
				});

			}, function(error) {

				if (error) {
					emitter.emit('error', error);
				}

				emitter.emit('end');
			});
		});

		return emitter;
	},

	parsePageHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);
			var $pre = $('.post-body pre').first();
			var lines = $pre.text().trim().split('\n');

			_.each(lines, function(line) {
				var host = line.trim().split(':');
				proxies.push({
					ipAddress: host[0],
					port: parseInt(host[1])
				});
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	},

	getPageUrls: function(cb) {

		async.seq(
			this.getHtml.bind(this, this.homeUrl),
			this.parseIndexPageHtml
		)(cb);
	},

	parseIndexPageHtml: function(html, cb) {

		try {

			var urls = [];
			var $ = cheerio.load(html);

			var $item;

			for (var i = 0; i < numberPagesOfProxiesToGet; i++) {

				$item = $('article:nth-child(1)');

				if ($item) {
					urls.push($item.find('header a').attr('href'));
				}
			}

		} catch (error) {
			return cb(error);
		}

		cb(null, urls);
	},

	getHtml: function(url, cb) {

		request({
			method: 'GET',
			url: url
		}, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html);
		});
	}
};
