'use strict';

var _ = require('underscore');
var async = require('async');
var expect = require('chai').expect;

describe('source.gatherproxy', function() {

	var Source = require('../../../sources/gatherproxy');

	describe('solveCaptcha(captcha)', function() {

		it('should be a function', function() {

			expect(Source.solveCaptcha).to.be.a('function');
		});

		it('should correctly solve the captchas', function() {

			var captchas = [
				{ question: 'Six minus 2 =', solution: 4 },
				{ question: 'Three + Two =', solution: 5 },
				{ question: 'Seven + 5 =', solution: 12 },
				{ question: '8 - One =', solution: 7 },
				{ question: '7 minus Five =', solution: 2 },
				{ question: '7 X zero =', solution: 0 }
			];

			_.each(captchas, function(captcha) {
				expect(Source.solveCaptcha(captcha.question)).to.equal(captcha.solution);
			});
		});
	});

	describe('getRandomUser()', function() {

		it('should be a function', function() {

			expect(Source.getRandomUser).to.be.a('function');
		});

		it('should return a random user', function() {

			var user = Source.getRandomUser();

			expect(user).to.be.an('object');
			expect(user.email).to.be.a('string');
			expect(user.password).to.be.a('string');
		});
	});

	describe('getSessionCookie(cookies)', function() {

		it('should be a function', function() {

			expect(Source.getSessionCookie).to.be.a('function');
		});

		it('should get the session cookie from an array of cookies', function() {

			var cookies = [
				'ASP.NET_SessionId=yqzcmlp44p3mewwm4cfjrphr; path=/; HttpOnly',
				'ASP.NET_SessionId=yqzcmlp44p3mewwm4cfjrphr; path=/; HttpOnly',
				'_lang=en-US; expires=Wed, 24-May-2017 16:32:35 GMT; path=/'
			];

			var sessionCookie = Source.getSessionCookie(cookies);

			expect(sessionCookie).to.equal('ASP.NET_SessionId=yqzcmlp44p3mewwm4cfjrphr');
		});
	});

	describe('parseDownloadPageHtml(html)', function() {

		it('should be a function', function() {

			expect(Source.parseDownloadPageHtml).to.be.a('function');
		});

		it('should parse the HTML for the download link', function(done) {

			var samples = require('../../samples/gatherproxy/downloadPageHtml');

			async.each(samples, function(html, next) {

				Source.parseDownloadPageHtml(html, function(error, downloadLink) {

					try {
						expect(error).to.equal(null);
						expect(downloadLink).to.be.a('string');
						expect(downloadLink).to.not.equal('');
					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});
});
