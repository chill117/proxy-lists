'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var decodeProxyRegex = /str_rot13\("(.+)"\)/;

module.exports = {

	homeUrl: 'http://www.cool-proxy.net/proxies/http_proxy_list',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getProxiesFromPage = async.seq(
			_.bind(this.getPage, this),
			_.bind(this.parsePage, this)
		);

		this.getPageLinks(options, function(error, links) {
			async.each(links, function(link, next) {
				getProxiesFromPage(link, options, function(error, proxies) {
					if (error) {
						emitter.emit('error', error);
					} else {
						emitter.emit('data', proxies);
					}
					next();
				});
			}, function(){
				emitter.emit('end');
			});
		});

		return emitter;
	},

	getPageLinks: function(options, cb) {

		var homeUrl = this.homeUrl;

		options.request({
			method: 'GET',
			url: homeUrl
		}, function(error, res, body) {

			if (error) {
				return cb(error);
			}

			try {
				var $ = cheerio.load(body);
				$('span.next').remove();
				var maxPage = $('.pagination a').last().html();
				var links = [];
				for (var index = 1; index <= maxPage; index++) {
					links.push(homeUrl + '/page:' + index);
				}
			} catch (error) {
				return cb(error);
			}

			cb(null, links);
		});
	},

	getPage: function(link, options, cb) {

		options.request({
			method: 'GET',
			url: link
		}, function(error, res, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html);
		});
	},

	parsePage: function(html, cb) {

		var decodeProxy = _.bind(this.decodeProxy, this);

		_.defer(function() {
			try {
				var $ = cheerio.load(html);
				$('table tr').last().remove();
				var proxies = $('table tr').map(function(index, tr) {
					var tds = $(tr).find('td');
					if (tds.length < 3) {
						return null;
					}
					var ip = decodeProxy($(tds[0]).html());
					var port = $(tds[1]).html();
					var anonymity = $(tds[5]).html() === 'Anonymous' ? 'anonymous' : 'transparent';
					return {
						ipAddress: ip,
						port: parseInt(port),
						protocols: ['http'],
						anonymityLevel: anonymity,
					};
				}).get();
			} catch (error) {
				return cb(error);
			}
			cb(null, proxies);
		});
	},

	decodeProxy: function(html) {

		var strRot13 = function(str) {
			return (str + '').replace(/[a-z]/gi, function(s) {
				return String.fromCharCode(s.charCodeAt(0) + (s.toLowerCase() < 'n' ? 13 : -13));
			});
		};
		var hash = html.match(decodeProxyRegex);

		return Buffer.from(strRot13(hash[1]), 'base64').toString();
	}
};
