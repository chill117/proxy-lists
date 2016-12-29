'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

module.exports = {

	homeUrl: 'http://sockslist.net/',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		// This proxy source only has socks proxies.
		if (_.contains(options.protocols, 'socks4') || _.contains(options.protocols, 'socks5')) {

			var basePageUrl = 'http://sockslist.net/proxy/server-socks-hide-ip-address/{page}';

			var getProxiesFromPage = async.seq(

				function(page, cb) {
					var listUrl = basePageUrl.replace('{page}', page);
					cb(null, listUrl);
				},

				this.getListHtml,
				this.parseListHtml
			);

			getProxiesFromPage(1, function(error, proxies, numPages) {

				if (error) {
					emitter.emit('error', error);
					return emitter.emit('end');
				}

				// Emit the proxies from the first page.
				emitter.emit('data', proxies);

				if (options.sample) {
					return emitter.emit('end');
				}

				var asyncMethod = options.series === true ? 'timesSeries' : 'times';

				async[asyncMethod](numPages - 1, _.bind(function(index, nextPage) {

					var pageNumber = index + 2;

					getProxiesFromPage(pageNumber, function(error, proxies) {

						if (error) {
							emitter.emit('error', error);
						} else {
							emitter.emit('data', proxies);
						}

						nextPage();
					});

				}, this), function() {

					emitter.emit('end');
				});
			});

		} else {

			// Nothing to do.
			// Just end.
			setTimeout(_.bind(emitter.emit, emitter, 'end'), 0);
		}

		return emitter;
	},

	getListHtml: function(listUrl, cb) {

		request({
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
			var numPages = $('#pages a').length - 1;

			var requiredVarsStr = listHtml.toString();

			requiredVarsStr = requiredVarsStr.substr(requiredVarsStr.indexOf('//<![CDATA[') + '//<![CDATA['.length);
			requiredVarsStr = requiredVarsStr.substr(0, requiredVarsStr.indexOf('//]]>')).trim();

			var parseXorExpression = function(xorExpr) {

				var value;

				if (xorExpr.indexOf('^') === -1) {
					value = parseInt(xorExpr);
				} else {
					var xorExprParts = _.map(xorExpr.split('^'), function(xorExprPart) {
						if (/[a-zA-Z]/.test(xorExprPart)) {
							// Variable.
							return parseInt(requiredVars[xorExprPart]);
						} else {
							// Integer.
							return parseInt(xorExprPart);
						}
					});
					value = _.reduce(_.rest(xorExprParts, 1), function(memo, xorExprPart) {
						return memo ^ xorExprPart;
					}, _.first(xorExprParts));
				}

				return value;
			};

			var requiredVars = {};

			_.each(requiredVarsStr.split(';'), function(requiredVarStr) {

				var requiredVar = requiredVarStr.split(' = ');
				var name = requiredVar[0];
				var valueExpr = requiredVar[1];

				if (valueExpr) {
					requiredVars[name] = parseXorExpression(valueExpr);
				}
			});

			$('table.proxytbl tr').each(function(index, tr) {

				if (index === 0) {
					// Skip the first row.
					return;
				}

				var ipAddress = $('td.t_ip', tr).eq(0).text().toString();
				var portXorExpr = $('td.t_port', tr).eq(0).text().toString().match(/document\.write\(([^\(\)]+)\)/)[1];
				var port = parseXorExpression(portXorExpr);
				var protocol = $('td.t_type', tr).eq(0).text().toString().toLowerCase().trim();
				var protocols;

				switch (protocol) {

					case '4':
						protocols = ['socks4'];
						break;

					case '4/5':
						protocols = ['socks5', 'socks4'];
						break;

					case '5':
						protocols = ['socks5'];
						break;
				}

				proxies.push({
					ipAddress: ipAddress,
					port: port,
					protocols: protocols,
					anonymityLevel: null
				});
			});

		} catch (error) {

			return cb(error);
		}

		cb(null, proxies, numPages);
	}
};
