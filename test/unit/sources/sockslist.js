'use strict';

var async = require('async');
var expect = require('chai').expect;

describe('source.sockslist', function() {

	var sockslist = require('../../../sources/sockslist');

	describe('parseListHtml(listHtml, cb)', function() {

		it('should be a function', function() {

			expect(sockslist.parseListHtml).to.be.a('function');
		});

		it('should extract a list of proxies and number of pages from the HTML', function(done) {

			var samples = require('../../samples/sockslist/listHtml');

			async.each(samples, function(listHtml, next) {

				sockslist.parseListHtml(listHtml, function(error, proxies, numPages) {

					try {
						expect(error).to.equal(null);
						expect(proxies).to.be.an('array');
						expect(numPages).to.be.a('number');
					} catch (error) {
						return next(error);
					}

					next();
				});

			}, done);
		});
	});
});
