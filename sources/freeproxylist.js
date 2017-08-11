'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var anonymityLevels = {
	'elite proxy': 'elite',
};

module.exports = {

	homeUrl: 'http://free-proxy-list.net/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();
		var listUrls = this.prepareListUrls(options);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		var getList = async.seq(
			this.getListHtml.bind(this),
			this.parseListHtml.bind(this)
		);

		async[asyncMethod](listUrls, function(listUrl, next) {

			getList(listUrl, options, function(error, proxies) {

				if (error) {
					emitter.emit('error', error);
				} else {
					emitter.emit('data', proxies);
				}

				next();
			});

		}, function() {

			emitter.emit('end');
		});

		return emitter;
	},

	prepareListUrls: function(options) {

		var listUrls = [];

		if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {
			listUrls.push('http://www.socks-proxy.net/');
		}

		if (_.contains(options.protocols, 'https')) {
			listUrls.push('http://www.sslproxies.org/');
		}

		if (_.contains(options.anonymityLevels, 'transparent') || _.contains(options.protocols, 'http')) {
			listUrls.push('http://free-proxy-list.net/');
		}

		if (_.contains(options.anonymityLevels, 'anonymous') || _.contains(options.anonymityLevels, 'elite')) {
			listUrls.push('http://free-proxy-list.net/anonymous-proxy.html');
		}

		if (options.sample) {
			// When sampling, use only one list URL.
			listUrls = listUrls.slice(0, 1);
		}

		return listUrls;
	},

	getListHtml: function(listUrl, options, cb) {

		options.request({
			method: 'GET',
			url: listUrl
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseListHtml: function(listHtml, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(listHtml);
			var columnIndexes = {};

			$('th', $('table thead tr').first()).each(function(index) {

				var key = $(this).text().toString().toLowerCase().replace(/ /g, '_');
				columnIndexes[key] = index;
			});

			if (!_.isUndefined(columnIndexes['version'])) {
				columnIndexes['protocol'] = columnIndexes['version'];
			} else {
				columnIndexes['https'] = columnIndexes['version'];
			}

			$('table tbody tr').each(function(index, tr) {

				var ipAddress = $('td', tr).eq(columnIndexes['ip_address']).text().toString();
				var port = parseInt($('td', tr).eq(columnIndexes['port']).text().toString());

				var protocol;

				if (!_.isUndefined(columnIndexes['version'])) {
					protocol = $('td', tr).eq(columnIndexes['version']).text().toString().toLowerCase();
				} else {
					protocol = $('td', tr).eq(columnIndexes['https']).text().toString().toLowerCase() === 'yes' ? 'https' : 'http';
				}

				var anonymityLevel = $('td', tr).eq(columnIndexes['anonymity']).text().toString().toLowerCase();

				if (!_.isUndefined(anonymityLevels[anonymityLevel])) {
					anonymityLevel = anonymityLevels[anonymityLevel];
				}

				proxies.push({
					ipAddress: ipAddress,
					port: port,
					protocols: [protocol],
					anonymityLevel: anonymityLevel
				});
			});

		} catch (error) {

			return cb(error);
		}

		cb(null, proxies);
	}
};
