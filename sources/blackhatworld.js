'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var threadUrls = [
	'https://www.blackhatworld.com/seo/100-scrapebox-proxies.297574/'
];

module.exports = {

	homeUrl: 'https://www.blackhatworld.com',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromThread = this.getProxiesFromLastPostInThread.bind(this);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](threadUrls, function(threadUrl, nextThread) {

			getProxiesFromThread(threadUrl, function(error, proxies) {

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

	getProxiesFromLastPostInThread: function(threadUrl, cb) {

		async.seq(
			this.getThreadLastPageUrl.bind(this),
			this.getHtml.bind(this),
			this.parseLastPageOfThreadHtml.bind(this)
		)(threadUrl, cb);
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

	getThreadLastPageUrl: function(threadUrl, cb) {

		async.seq(
			this.getHtml.bind(this),
			this.parseForumThreadHtml.bind(this)
		)(threadUrl, cb);
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
