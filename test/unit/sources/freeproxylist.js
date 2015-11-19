'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.freeproxylist', function() {

	var freeproxylist = require('../../../sources/freeproxylist');

	describe('parseListData(listData, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylist.parseListData).to.be.a('function');
		});

		it('should parse the list data into an array of proxies', function(done) {

			var listData = [
				'<table cellpadding="0" cellspacing="0" border="0" class="display fpltable" id="proxylisttable"><thead><tr><th>IP Address</th><th>Port</th><th>Code</th><th>Country</th><th>Version</th><th>Anonymity</th><th>Https</th><th>Last Checked</th></tr></thead><tbody><tr><td>24.203.89.157</td><td>23154</td><td>CA</td><td>Canada</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>166.62.97.24</td><td>18628</td><td>US</td><td>United States</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>166.111.120.164</td><td>10080</td><td>CN</td><td>China</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>76.164.199.173</td><td>8080</td><td>US</td><td>United States</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>103.28.149.213</td><td>1080</td><td>ID</td><td>Indonesia</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>176.215.11.3</td><td>1080</td><td>RU</td><td>Russian Federation</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>24.196.69.180</td><td>1080</td><td>US</td><td>United States</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>109.202.118.121</td><td>1080</td><td>IM</td><td>Isle of Man</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>100.7.34.243</td><td>30655</td><td>US</td><td>United States</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>166.62.96.57</td><td>18628</td><td>US</td><td>United States</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>119.9.76.202</td><td>1080</td><td>HK</td><td>Hong Kong</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>58.250.87.87</td><td>10080</td><td>CN</td><td>China</td><td>Socks5</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>176.109.189.158</td><td>1080</td><td>UA</td><td>Ukraine</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>78.24.223.23</td><td>2246</td><td>RU</td><td>Russian Federation</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr><tr><td>78.188.219.241</td><td>1080</td><td>TR</td><td>Turkey</td><td>Socks4</td><td>Anonymous</td><td>Yes</td><td>26 seconds ago</td></tr></tbody><tfoot><tr><th class="input"><input type="text"></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot></table>',
				'<table cellpadding="0" cellspacing="0" border="0" class="display fpltable" id="proxylisttable"><thead><tr><th>IP Address</th><th>Port</th><th>Code</th><th>Country</th><th>Anonymity</th><th>Google</th><th>Https</th><th>Last Checked</th></tr></thead><tbody><tr><td>190.72.43.149</td><td>8080</td><td>VE</td><td>Venezuela</td><td>anonymous</td><td>no</td><td>yes</td><td>21 seconds ago</td></tr><tr><td>186.92.49.71</td><td>8080</td><td>VE</td><td>Venezuela</td><td>anonymous</td><td>no</td><td>yes</td><td>21 seconds ago</td></tr><tr><td>203.174.53.94</td><td>3128</td><td>HK</td><td>Hong Kong</td><td>anonymous</td><td>yes</td><td>yes</td><td>21 seconds ago</td></tr><tr><td>52.88.219.1</td><td>3128</td><td>US</td><td>United States</td><td>elite proxy</td><td>yes</td><td>yes</td><td>1 minute ago</td></tr><tr><td>165.139.149.169</td><td>3128</td><td>US</td><td>United States</td><td>elite proxy</td><td>no</td><td>yes</td><td>1 minute ago</td></tr><tr><td>52.26.96.247</td><td>80</td><td>US</td><td>United States</td><td>elite proxy</td><td>no</td><td>no</td><td>1 minute ago</td></tr><tr><td>166.78.165.36</td><td>3128</td><td>US</td><td>United States</td><td>anonymous</td><td>yes</td><td>yes</td><td>1 minute ago</td></tr><tr><td>67.50.235.166</td><td>8080</td><td>US</td><td>United States</td><td>elite proxy</td><td>no</td><td>no</td><td>1 minute ago</td></tr><tr><td>118.169.125.22</td><td>80</td><td>TW</td><td>Taiwan</td><td>elite proxy</td><td>yes</td><td>no</td><td>1 minute ago</td></tr><tr><td>190.206.2.220</td><td>8080</td><td>VE</td><td>Venezuela</td><td>anonymous</td><td>no</td><td>no</td><td>1 minute ago</td></tr><tr><td>177.159.200.100</td><td>3128</td><td>BR</td><td>Brazil</td><td>anonymous</td><td>no</td><td>yes</td><td>1 minute ago</td></tr></tbody><tfoot><tr><th class="input"><input type="text"></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr></tfoot></table>',
			];

			freeproxylist.parseListData(listData, function(error, proxies) {

				try {

					expect(error).to.equal(null);
					expect(proxies).to.be.an('array');
					expect(proxies.length > 0).to.equal(true);

					var invalidProxies = [];

					_.each(proxies, function(proxy) {

						try {

							expect(ProxyLists.isValidProxy(proxy)).to.equal(true);

						} catch (error) {

							invalidProxies.push(proxy);
						}
					});

					expect(invalidProxies).to.deep.equal([]);

				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});

	describe('getListUrls(options, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylist.getListUrls).to.be.a('function');
		});

		it('should return an array of list URLs', function(done) {

			var options = {
				protocols: ['http', 'https'],
				anonymityLevels: ['transparent']
			};

			freeproxylist.getListUrls(options, function(error, listUrls) {

				try {

					expect(error).to.equal(null);
					expect(listUrls).to.be.an('array');
					expect(listUrls.length > 0).to.equal(true);

					_.each(listUrls, function(listUrl) {
						expect(listUrl).to.be.a('string');
						expect(listUrl.length > 0).to.equal(true);
						expect(listUrl.substr(0, 'http'.length)).to.equal('http');
					});

				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});

	describe('getListData(listUrls, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylist.getListData).to.be.a('function');
		});

		it('should return a list data for each list URL provided', function(done) {

			this.timeout(15000);

			var listUrls = [
				'http://www.socks-proxy.net/'
			];

			freeproxylist.getListData(listUrls, function(error, listData) {

				try {

					expect(error).to.equal(null);
					expect(listData).to.be.an('array');
					expect(listData).to.have.length(1);

					_.each(listData, function(data) {
						expect(data).to.be.a('string');
						expect(data.length > 0).to.equal(true);
					});

				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});
});
