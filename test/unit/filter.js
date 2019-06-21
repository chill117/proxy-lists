'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var ProxyLists = require('../../index');

describe('filter', function() {

	var tests = [
		{
			description: 'defaults',
			options: {
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
					anonymityLevel: 'elite',
					protocols: ['socks5'],
				},
			],
			out: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
					anonymityLevel: 'elite',
					protocols: ['socks5'],
				},
			],
		},
		{
			description: 'filterMode: "loose"',
			options: {
				filterMode: 'loose',
				countries: ['aa'],
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
				},
			],
			out: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
			],
		},
		{
			description: 'filterMode: "strict"',
			options: {
				filterMode: 'strict',
				countries: ['aa'],
				anonymityLevel: null,
				protocols: null,
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
				},
			],
			out: [
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
			],
		},
		{
			description: 'countries',
			options: {
				countries: ['aa', 'bb', 'CC'],
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8085,
					country: 'cc',
				},
			],
			out: [
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8085,
					country: 'cc',
				},
			],
		},
		{
			description: 'countriesBlackList',
			options: {
				filterMode: 'loose',
				countries: null,
				countriesBlackList: ['aa'],
				anonymityLevel: null,
				protocols: null,
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
				},
			],
			out: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
				},
			],
		},
		{
			description: 'anonymityLevels',
			options: {
				anonymityLevels: ['elite'],
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
					anonymityLevel: 'transparent',
					protocols: ['http'],
				},
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
					anonymityLevel: 'elite',
					protocols: ['socks5'],
				},
			],
			out: [
				{
					ipAddress: '127.0.0.3',
					port: 8083,
					country: 'bb',
					anonymityLevel: 'elite',
					protocols: ['socks5'],
				},
			],
		},
		{
			description: 'protocols',
			options: {
				protocols: ['socks4', 'socks5'],
			},
			in: [
				{
					ipAddress: '127.0.0.1',
					port: 8081,
				},
				{
					ipAddress: '127.0.0.2',
					port: 8082,
					country: 'aa',
					anonymityLevel: 'transparent',
					protocols: ['http'],
				},
				{
					ipAddress: '127.0.0.3',
					port: 8085,
					country: 'cc',
					anonymityLevel: 'anonymous',
					protocols: ['socks5'],
				},
			],
			out: [
				{
					ipAddress: '127.0.0.3',
					port: 8085,
					country: 'cc',
					anonymityLevel: 'anonymous',
					protocols: ['socks5'],
				},
			],
		},
	];

	_.each(tests, function(test) {
		it(test.description, function() {
			var sourcerOptions = ProxyLists.toSourcerOptions(test.options);
			var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
			var filtered = ProxyLists.sourcer.filterData(test.in, filterOptions);
			expect(filtered).to.deep.equal(test.out);
		});
	});
});
