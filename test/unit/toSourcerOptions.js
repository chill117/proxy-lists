'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var ProxyLists = require('../../index');

describe('toSourcerOptions([options])', function() {

	var tests = [
		{
			description: 'defaults',
			in: null,
			out: {
				filter: {
					mode: 'strict',
					include: {},
					exclude: {},
				},
			},
		},
		{
			description: 'filter',
			in: {
				filterMode: 'loose',
				countries: ['AA', 'bb', 'cc'],
				countriesBlackList: ['DD', 'ee'],
				anonymityLevels: ['elite'],
				protocols: ['SOCKS5', 'socks4'],
			},
			out: {
				filter: {
					mode: 'loose',
					include: {
						country: ['aa', 'bb', 'cc'],
						anonymityLevel: ['elite'],
						protocols: ['socks5', 'socks4'],
					},
					exclude: {
						country: ['dd', 'ee'],
					},
				},
			},
		},
	];

	it('should be a function', function() {
		expect(ProxyLists.toSourcerOptions).to.be.a('function');
	});

	_.each(tests, function(test) {
		it(test.description, function() {
			var sourcerOptions = ProxyLists.toSourcerOptions(test.in);
			expect(sourcerOptions).to.deep.equal(test.out);
		});
	});
});
