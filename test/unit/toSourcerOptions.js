'use strict';

var expect = require('chai').expect;

var ProxyLists = require('../../index');

describe('toSourcerOptions([options])', function() {

	var sampleData;
	before(function() {
		sampleData = [
			{
				ipAddress: '127.0.0.1',
				port: 8081,
			},
			{
				ipAddress: '127.0.0.2',
				port: 8082,
				country: 'aa',
				protocols: ['http'],
				anonymityLevel: 'transparent',
			},
			{
				ipAddress: '127.0.0.3',
				port: 8083,
				country: 'bb',
				protocols: ['https'],
				anonymityLevel: 'anonymous',
			},
			{
				ipAddress: '127.0.0.4',
				port: 8084,
				country: 'cc',
				protocols: ['http', 'https'],
				anonymityLevel: 'transparent',
			},
			{
				ipAddress: '127.0.0.5',
				port: 8085,
				country: 'dd',
				protocols: ['socks5'],
				anonymityLevel: 'elite',
			},
			{
				ipAddress: '127.0.0.6',
				port: 8086,
				country: 'ee',
				protocols: ['https'],
				anonymityLevel: 'elite',
			},
		];
	});

	it('should be a function', function() {
		expect(ProxyLists.toSourcerOptions).to.be.a('function');
	});

	it('defaults', function() {

		var sourcerOptions = ProxyLists.toSourcerOptions();
		expect(sourcerOptions).to.be.an('object');
		expect(sourcerOptions.filter).to.be.an('object');
		expect(sourcerOptions.filter.mode).to.equal(ProxyLists.defaultOptions.filterMode);
		expect(sourcerOptions.filter.include).to.deep.equal({});
		expect(sourcerOptions.filter.exclude).to.deep.equal({});
	});

	it('filterMode', function() {

		var options = {
			filterMode: 'loose',
			countries: ['aa'],
		};
		var sourcerOptions = ProxyLists.toSourcerOptions(options);
		expect(sourcerOptions.filter.mode).to.deep.equal(options.filterMode);

		var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
		var filtered = ProxyLists.sourcer.filterData(sampleData, filterOptions);
		expect(filtered).to.deep.equal([
			{
				ipAddress: '127.0.0.1',
				port: 8081
			},
			{
				ipAddress: '127.0.0.2',
				port: 8082,
				country: 'aa',
				protocols: [ 'http' ],
				anonymityLevel: 'transparent'
			}
		]);
	});

	it('countries', function() {

		var options = {
			countries: ['aa', 'bb'],
		};
		var sourcerOptions = ProxyLists.toSourcerOptions(options);
		expect(sourcerOptions.filter.include).to.deep.equal({
			country: options.countries,
		});
		expect(sourcerOptions.filter.exclude).to.deep.equal({});

		var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
		var filtered = ProxyLists.sourcer.filterData(sampleData, filterOptions);
		expect(filtered).to.deep.equal([
			{
				ipAddress: '127.0.0.2',
				port: 8082,
				country: 'aa',
				protocols: [ 'http' ],
				anonymityLevel: 'transparent'
			},
			{
				ipAddress: '127.0.0.3',
				port: 8083,
				country: 'bb',
				protocols: [ 'https' ],
				anonymityLevel: 'anonymous'
			}
		]);
	});

	it('countriesBlackList', function() {

		var options = {
			countriesBlackList: ['aa', 'bb', 'cc'],
		};
		var sourcerOptions = ProxyLists.toSourcerOptions(options);
		expect(sourcerOptions.filter.include).to.deep.equal({});
		expect(sourcerOptions.filter.exclude).to.deep.equal({
			country: options.countriesBlackList,
		});

		var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
		var filtered = ProxyLists.sourcer.filterData(sampleData, filterOptions);
		expect(filtered).to.deep.equal([
			{
				ipAddress: '127.0.0.1',
				port: 8081
			},
			{
				ipAddress: '127.0.0.5',
				port: 8085,
				country: 'dd',
				protocols: [ 'socks5' ],
				anonymityLevel: 'elite'
			},
			{
				ipAddress: '127.0.0.6',
				port: 8086,
				country: 'ee',
				protocols: [ 'https' ],
				anonymityLevel: 'elite'
			}
		]);
	});

	it('protocols', function() {

		var options = {
			protocols: ['http', 'https'],
		};
		var sourcerOptions = ProxyLists.toSourcerOptions(options);
		expect(sourcerOptions.filter.include).to.deep.equal({
			protocols: options.protocols,
		});
		expect(sourcerOptions.filter.exclude).to.deep.equal({});

		var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
		var filtered = ProxyLists.sourcer.filterData(sampleData, filterOptions);
		expect(filtered).to.deep.equal([
			{
				ipAddress: '127.0.0.2',
				port: 8082,
				country: 'aa',
				protocols: [ 'http' ],
				anonymityLevel: 'transparent'
			},
			{
				ipAddress: '127.0.0.3',
				port: 8083,
				country: 'bb',
				protocols: [ 'https' ],
				anonymityLevel: 'anonymous'
			},
			{
				ipAddress: '127.0.0.4',
				port: 8084,
				country: 'cc',
				protocols: [ 'http', 'https' ],
				anonymityLevel: 'transparent'
			},
			{
				ipAddress: '127.0.0.6',
				port: 8086,
				country: 'ee',
				protocols: [ 'https' ],
				anonymityLevel: 'elite'
			}
		]);
	});

	it('anonymityLevels', function() {

		var options = {
			anonymityLevels: ['elite'],
		};

		var sourcerOptions = ProxyLists.toSourcerOptions(options);
		expect(sourcerOptions.filter.include).to.deep.equal({
			anonymityLevel: options.anonymityLevels,
		});
		expect(sourcerOptions.filter.exclude).to.deep.equal({});

		var filterOptions = ProxyLists.sourcer.prepareFilterOptions(sourcerOptions.filter);
		var filtered = ProxyLists.sourcer.filterData(sampleData, filterOptions);
		expect(filtered).to.deep.equal([
			{
				ipAddress: '127.0.0.5',
				port: 8085,
				country: 'dd',
				protocols: [ 'socks5' ],
				anonymityLevel: 'elite'
			},
			{
				ipAddress: '127.0.0.6',
				port: 8086,
				country: 'ee',
				protocols: [ 'https' ],
				anonymityLevel: 'elite'
			}
		]);
	});
});
