'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var threadUrls = [
	'https://www.blackhatworld.com/seo/100-scrapebox-proxies.297574/',
	'https://www.blackhatworld.com/seo/gscraper-proxies.703493/',
	'https://www.blackhatworld.com/seo/port-scanned-proxies.988868/',
	'https://www.blackhatworld.com/seo/gsa-proxies-proxygo.830325/',
	'https://www.blackhatworld.com/seo/socks-proxies-occasional-update.803039/',
	'https://www.blackhatworld.com/seo/ssl-proxies-occasional-update.927669/',
	'https://www.blackhatworld.com/seo/anonymous-proxies.806981/',
	'https://www.blackhatworld.com/seo/tunnel-connect-proxies.951125/',
];

module.exports = {

	homeUrl: 'https://www.blackhatworld.com',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromThread = this.getProxiesFromLastPostInThread.bind(this);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](threadUrls, function(threadUrl, nextThread) {

			getProxiesFromThread(threadUrl, options, function(error, proxies) {

				if (error) {
					return nextThread(error);
				}

				if (!_.isEmpty(proxies)) {
					emitter.emit('data', proxies);
				}

				nextThread();

			});

		}, function(error) {

			if (error) {
				emitter.emit('error', error);
			}

			emitter.emit('end');
		});

		return emitter;
	},

	getProxiesFromLastPostInThread: function(threadUrl, options, cb) {

		var getProxiesFromLastPageOfThread = async.seq(
			this.getHtml.bind(this),
			this.parseLastPageOfThreadHtml.bind(this)
		);

		this.getThreadLastPageUrl(threadUrl, options, function(error, lastPageUrl) {

			if (error) {
				return cb(error);
			}

			getProxiesFromLastPageOfThread(lastPageUrl, options, cb);
		});
	},

	parseLastPageOfThreadHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);
			var $pre = $('#messageList .message pre').last();
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

	getThreadLastPageUrl: function(threadUrl, options, cb) {

		async.seq(
			this.getHtml.bind(this),
			this.parseForumThreadHtml.bind(this)
		)(threadUrl, options, cb);
	},

	parseForumThreadHtml: function(html, cb) {

		try {

			if (!html) {
				throw new Error('Thread HTML is empty.');
			}

			var $ = cheerio.load(html);
			var $pageNav = $('.PageNav');
			var lastPage = $pageNav.attr('data-last').toString();
			var baseUrl = $pageNav.attr('data-baseurl').toString();
			var lastPageUrl = baseUrl.replace(/{{sentinel}}/, lastPage);

			if (lastPageUrl.indexOf('://') === -1) {

				if (lastPageUrl.substr(0, 1) !== '/') {
					lastPageUrl = '/' + lastPageUrl;
				}

				lastPageUrl = this.homeUrl + lastPageUrl;
			}

		} catch (error) {
			return cb(error);
		}

		cb(null, lastPageUrl);
	},

	getHtml: function(uri, options, cb) {

		options.request({
			method: 'GET',
			url: uri,
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
