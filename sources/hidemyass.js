'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var css = require('css');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

var anonymityLevelFixes = {
	'none': 'transparent',
	'low': 'transparent',
	'medium': 'transparent',
	'high': 'anonymous',
	'high +ka': 'elite',
};

var protocolFixes = {
	'socks4/5': 'socks5'
};

var hidemyass = module.exports = {

	homeUrl: 'http://proxylist.hidemyass.com/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		var fn = async.seq(
			this.getData,
			this.parseResponseData
		);

		fn(options, function(error, proxies) {

			if (error) {
				emitter.emit('error', error);
			} else {
				emitter.emit('data', proxies);
			}

			emitter.emit('end');
		});

		return emitter;
	},

	getData: function(options, cb) {

		var requestOptions = {
			method: 'POST',
			url: hidemyass.homeUrl,
			headers: {
				'User-Agent': 'request',
				'X-Requested-With': 'XMLHttpRequest'
			},
			form: {
				c: _.values(options.countries),
				allPorts: 1,
				pl: 'on',// "Planet Labs"?
				pr: [],// protocols
				a: [],// anonymityLevels
				sp: [
					2,// Medium (speed)
					3,// Fast (speed)
				],
				ct: [
					2,// Medium (connection time)
					3,// Fast (connection time)
				],
				s: 0,// Date tested (sort column)
				o: 0,// Desc (sort direction)
				pp: 3,// 100 per page
				sortBy: 'date',
			}
		};

		if (options.sample) {
			requestOptions.form.pp = 0;
		}

		if (_.contains(options.protocols, 'http')) {
			requestOptions.form.pr.push(0);
		}

		if (_.contains(options.protocols, 'https')) {
			requestOptions.form.pr.push(1);
		}

		if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {
			requestOptions.form.pr.push(2);
		}

		if (_.contains(options.anonymityLevels, 'transparent')) {
			requestOptions.form.a = requestOptions.form.a.concat([0, 1, 2]);
		}

		if (_.contains(options.anonymityLevels, 'anonymous')) {
			requestOptions.form.a.push(3);
		}

		if (_.contains(options.anonymityLevels, 'elite')) {
			requestOptions.form.a.push(4);
		}

		request(requestOptions, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseResponseData: function(data, cb) {

		try {

			data = JSON.parse(data);

			var proxies = [];
			var $ = cheerio.load('<table>' + data.table + '</table>');

			$('tr').each(function(index, tr) {

				var proxy = {};
				var ipEl = $('td', tr).eq(1);
				var styles = css.parse(ipEl.find('style').text());
				var protocol = $('td', tr).eq(6).text().toString().toLowerCase().trim();
				var port = parseInt($('td', tr).eq(2).text().toString().trim());
				var country = $('td', tr).eq(3).attr('rel').toString().toLowerCase().trim();
				var anonymityLevel = $('td', tr).eq(7).text().toString().toLowerCase().trim();

				if (protocolFixes[protocol]) {
					protocol = protocolFixes[protocol];
				}

				if (protocol === 'socks4/5') {
					proxy.protocols = ['socks5', 'socks4'];
				} else {
					proxy.protocols = [protocol];
				}

				if (anonymityLevelFixes[anonymityLevel]) {
					anonymityLevel = anonymityLevelFixes[anonymityLevel];
				}

				proxy.port = port;
				proxy.country = country;
				proxy.anonymityLevel = anonymityLevel;
				proxy.ipAddress = '';

				_.each(styles.stylesheet.rules, function(rule) {

					var applyCss = {};

					_.each(rule.declarations, function(declaration) {
						applyCss[declaration.property] = declaration.value;
					});

					_.each(rule.selectors, function(selector) {
						ipEl.find(selector).css(applyCss);
					});
				});

				_.each(ipEl.children('span')[0].children, function(node) {

					switch (node.type) {

						case 'text':
							proxy.ipAddress += node.data;
							break;

						case 'tag':

							if (['span', 'div'].indexOf(node.name) !== -1) {

								var isVisible = $(node).css('display') !== 'none';

								if (isVisible) {

									var contentHtml = $(node).html().toString();
									var contentText = $(node).text().toString();
									var isTextOnly = contentHtml.toString() === contentText.toString();
									var isNonEmpty = contentText !== '';

									if (isTextOnly && isNonEmpty) {
										proxy.ipAddress += contentText;
									}
								}
							}

							break;
					}
				});

				proxy.ipAddress = proxy.ipAddress.trim();

				proxies.push(proxy);
			});

		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	}
};
