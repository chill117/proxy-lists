'use strict';

var _ = require('underscore');
var async = require('async');
var cheerio = require('cheerio');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');
var querystring = require('querystring');

var users = [
	{ email: 'another1@devnullmail.com', password: 'Tt{[V;Ng' },
	{ email: 'another2@devnullmail.com', password: 'l-r5r=_X' },
	{ email: 'some.one@safetymail.info', password: '1pQGv&!+' },
	{ email: 'some.one.else@safetymail.info', password: '@EIU$%gX' },
	{ email: 'some.other@reconmail.com', password: 'aC|[#d#9' },
	{ email: 'email.address@reconmail.com', password: 'R_CR#+bu' },
	{ email: 'real@veryrealemail.com', password: '[dI>>SBG' },
	{ email: 'really.real@veryrealemail.com', password: '[pQZ*j-s' },
	{ email: 'someemail4@tradermail.info', password: 'q!gL$M{Q' },
	{ email: 'justsomeemail2@binkmail.com', password: '!(9(JEa3' }
];

var Source = module.exports = {

	homeUrl: 'http://gatherproxy.com',

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();

		async.seq(
			Source.login,
			Source.getDownloadLink,
			Source.downloadData,
			Source.parseData
		)(function(error, proxies) {

			if (error) {
				emitter.emit('error', error);
			} else {

				if (options.sample) {
					proxies = proxies.slice(0, 50);
				}

				emitter.emit('data', proxies);
			}

			emitter.emit('end');
		});

		return emitter;
	},

	getDownloadLink: function(cookie, cb) {

		request({
			method: 'GET',
			url: 'http://gatherproxy.com/subscribe/infos',
			headers: {
				'Cookie': cookie
			}
		}, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			var downloadLink;
			var $ = cheerio.load(html);
			var $anchor = $('#body > p a').eq(0);

			if ($anchor.length > 0) {
				downloadLink = $anchor.attr('href').toString().trim();
			}

			if (!downloadLink) {
				return cb(new Error('Could not find download link.'));
			}

			cb(null, downloadLink, cookie);
		});
	},

	downloadData: function(downloadLink, cookie, cb) {

		if (downloadLink.substr(0, Source.homeUrl.length) !== Source.homeUrl) {
			downloadLink = Source.homeUrl + downloadLink;
		}

		var query = querystring.parse(downloadLink.split('?')[1]);

		request({
			method: 'POST',
			url: downloadLink,
			headers: {
				'Cookie': cookie
			},
			form: {
				ID: query.sid,
				C: '',
				P: '',
				T: '',
				U: '0'
			}
		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},

	parseData: function(data, cb) {

		var proxies = [];

		try {
			_.each(data.trim().split('\n'), function(line) {

				var parts = line.split(':');
				var proxy = {
					ipAddress: parts[0],
					port: parseInt(parts[1]),
					protocols: ['http']
				};
				proxies.push(proxy);
			});
		} catch (error) {
			return cb(error);
		}

		cb(null, proxies);
	},

	login: function(cb) {

		var user = Source.getRandomUser();

		Source.getLoginCaptchaSolutionAndCookie(function(error, captchaSolution, cookie) {

			if (error) {
				return cb(error);
			}

			if (!cookie) {
				return cb(new Error('Missing required session cookie.'));
			}

			request({
				method: 'POST',
				url: 'http://gatherproxy.com/subscribe/login',
				headers: {
					'Cookie': cookie
				},
				form: {
					'Username': user.email,
					'Password': user.password,
					'Captcha': captchaSolution
				}
			}, function(error, response, html) {

				if (error) {
					return cb(error);
				}

				var $ = cheerio.load(html);
				var $error = $('.error');

				if ($error && $error.length > 0) {
					error = new Error($error.text().trim());
					error.debug = {
						cookie: cookie,
						form: {
							'Username': user.email,
							'Password': user.password,
							'Captcha': captchaSolution
						}
					};
					return cb(error);
				}

				cb(null, cookie);
			});
		});
	},

	getLoginCaptchaSolutionAndCookie: function(cb) {

		Source.getLoginPageCaptchaQuestionAndCookie(function(error, captcha, cookie) {

			if (error) {
				return cb(error);
			}

			try {
				var solution = Source.solveCaptcha(captcha);
			} catch (error) {
				return cb(error);
			}

			cb(null, solution, cookie);
		});
	},

	getLoginPageCaptchaQuestionAndCookie: function(cb) {

		request({
			method: 'GET',
			url: 'http://gatherproxy.com/subscribe/login'
		}, function(error, response, html) {

			if (error) {
				return cb(error);
			}

			var $ = cheerio.load(html);
			var captcha = $('.label .blue').text().trim();
			var cookie = Source.getSessionCookie(response.headers['set-cookie']);

			cb(null, captcha, cookie);
		});
	},

	getRandomUser: function() {

		return users[Math.floor(Math.random() * (users.length - 1))];
	},

	solveCaptcha: function(captcha) {

		var solution;

		var numbers = {
			'zero': 0,
			'one': 1,
			'two': 2,
			'three': 3,
			'four': 4,
			'five': 5,
			'six': 6,
			'seven': 7,
			'eight': 8,
			'nine': 9
		};

		var operators = {
			'plus': '+',
			'add': '+',
			'added': '+',
			'minus': '-',
			'substract': '-',
			'substracted': '-',
			'times': '*',
			'time': '*',
			'multiplied': '*',
			'multiply': '*',
			'x': '*',
			'divided': '/',
			'divide': '/'
		};

		// Remove equal signs.
		captcha = captcha.replace(/=/g, '');

		// Trim.
		captcha = captcha.trim();

		// Lower case.
		captcha = captcha.toLowerCase();

		// Convert text to numbers/symbols.
		var parts = _.map(captcha.split(' '), function(part) {

			if (!_.isUndefined(numbers[part])) {
				part = parseInt(numbers[part]);
			}

			if (!_.isUndefined(operators[part])) {
				part = operators[part];
			}

			return parseInt(part).toString() === part && parseInt(part) || part;
		});

		// The second part is the operator.
		var operator = parts[1];

		switch (operator) {

			case '+':
				solution = parts[0] + parts[2];
				break;

			case '-':
				solution = parts[0] - parts[2];
				break;

			case '*':
				solution = parts[0] * parts[2];
				break;

			case '/':
				solution = parts[0] / parts[2];
				break;

			default:
				throw new Error('Failed to solve Captcha ("' + captcha + '"): Invalid operator.');
		}

		return Math.round(solution);
	},

	getSessionCookie: function(cookies) {

		var name = 'ASP.NET_SessionId';
		var cookie = _.find(cookies, function(cookie) {
			return cookie.substr(0, name.length) === name;
		});
		return cookie && cookie.substr(0, cookie.indexOf(';'));
	}
};
