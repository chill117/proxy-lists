'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');

var anonymityLevelFixes = {
	'Transparent': 'transparent',
	'Anonymous': 'anonymous',
	'Distorting': 'anonymous',
	'High Anonymous': 'elite'
};

var limitPerPage = 50;

module.exports = {

	homeUrl: 'http://proxydb.net/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var getPageOfProxies = async.seq(
			this.getPageHtml.bind(this),
			this.parsePageHtml.bind(this)
		);

		options.countries = _.map(options.countries, function(country) {
			return country.toUpperCase();
		});

		var numProxiesFromLastPage;

		async.until(function() { return numProxiesFromLastPage < limitPerPage; }, function(nextPage) {

			var page = 1;

			getPageOfProxies(page++, options, function(error, proxies) {

				if (error) {
					return nextPage(error);
				}

				if (options.sample) {
					// Stop after this page.
					numProxiesFromLastPage = 0;
				} else {
					// Will continue if there are more pages to get.
					numProxiesFromLastPage = proxies && proxies.length || 0;
				}

				emitter.emit('data', proxies);
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

	getPageHtml: function(page, options, cb) {

		var requestOptions = {
			method: 'GET',
			url: 'http://proxydb.net/',
			qs: {
				offset: (page - 1) * limitPerPage,
				protocol: options.protocols,
				anonlvl: []
			}
		};

		if (_.contains(options.anonymityLevels, 'transparent')) {
			requestOptions.qs.anonlvl.push(1);
		}

		if (_.contains(options.anonymityLevels, 'anonymous')) {
			requestOptions.qs.anonlvl.push(2);
			requestOptions.qs.anonlvl.push(3);
		}

		if (_.contains(options.anonymityLevels, 'elite')) {
			requestOptions.qs.anonlvl.push(4);
		}

		options.request(requestOptions, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			cb(null, html);
		});
	},

	parsePageHtml: function(html, cb) {

		try {

			var proxies = [];
			var $ = cheerio.load(html);
			var parseHostFromScriptObfuscation = this.parseHostFromScriptObfuscation.bind(this);

			$('table tbody tr').each(function() {

				var $tr = $(this);
				var scriptContent = $tr.find('script').html();
				var host = parseHostFromScriptObfuscation(scriptContent);

				if (host) {

					host = host.split(':');
					var protocol = $tr.find('td:nth-child(2)').text().trim().toLowerCase();
					var anonymityLevel = $tr.find('td:nth-child(3)').text().trim();

					var proxy = {
						ipAddress: host[0],
						port: parseInt(host[1]),
						protocols: [protocol]
					};

					if (anonymityLevel && anonymityLevelFixes[anonymityLevel]) {
						proxy.anonymityLevel = anonymityLevelFixes[anonymityLevel];
					}

					proxies.push(proxy);
				}
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	},

	parseHostFromScriptObfuscation: function(content) {

		try {
			var parts = content.trim().split('\n');
			var ipAddressPart1 = parts[0].trim().match(/var x = '([^']+)'\.split\(''\)\.reverse\(\)\.join\(''\);/)[1].split('').reverse().join('');
			var ipAddressPart2 = parts[1].trim().match(/var y = '([^']+)';/)[1];
			var portMatches = parts[2].trim().match(/var p = -([0-9]+) \+ ([0-9]+);/);
			var port = parseInt(portMatches[2]) - parseInt(portMatches[1]);
			var host = ipAddressPart1 + ipAddressPart2 + ':' + port;
		} catch (error) {
			// Do nothing with the error.
		}
		return host || null;
	}
};
