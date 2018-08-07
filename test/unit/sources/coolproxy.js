'use strict';

var expect = require('chai').expect;
var _ = require('underscore');

describe('source.coolproxy', function() {

	var coolproxy = require('../../../sources/coolproxy');

	describe('decodeProxy(html)', function() {

		it('should be a function', function() {
			expect(coolproxy.decodeProxy).to.be.a('function');
		});

		it('should decode encrypted proxy', function() {
			var unencryptedProxy = '212.227.10.147';
			var encryptedProxy = '<script type="text/javascript">document.write(Base64.decode(str_rot13("ZwRlYwVlAl4kZP4kAQp=")))</script>';
			expect(coolproxy.decodeProxy(encryptedProxy)).to.equal(unencryptedProxy);
		});
	});

	describe('parsePages(html, cb)', function() {

		it('should be a function', function() {
			expect(coolproxy.parsePage).to.be.a('function');
		});

		it('should parse and return proxies', function(done) {
			var sample = require('../../samples/coolproxy/listHtml');
			coolproxy.parsePage(sample.toString(), function(error, proxies) {
				try {
					expect(error).to.equal(null);
					expect(proxies).to.be.an('array');
					expect(proxies.length > 0).to.equal(true);
					_.each(proxies, function(proxy) {
						expect(proxy.ipAddress).to.not.be.undefined;
						expect(proxy.ipAddress).to.be.a('string');
						expect(proxy.port).to.not.be.undefined;
						expect(proxy.port).to.be.a('number');
						expect(proxy.port).to.equal(parseInt(proxy.port));
						expect(proxy.protocols).to.be.an('array');
					});
				} catch (error) {
					return done(error);
				}
				done();
			});
		});
	});
});
