'use strict';

describe('prepareOptions([options])', function() {

	it('should be a function', function() {

		expect(ProxyLists.prepareOptions).to.be.a('function');
	});

	it('should return default options when none are provided', function() {

		var options = ProxyLists.prepareOptions();
		var defaultOptions = ProxyLists.prepareOptions(ProxyLists.defaultOptions);

		expect(options).to.deep.equal(defaultOptions);
	});

	describe('countries', function() {

		it('should convert the array of country codes to an object where {"code": "Country Name"}', function() {

			var options;

			options = ProxyLists.prepareOptions({ countries: ['ca', 'is'] });
			expect(options.countries).to.deep.equal({ ca: 'Canada', is: 'Iceland' });
		});
	});
});
