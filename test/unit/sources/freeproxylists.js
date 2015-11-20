'use strict';

var _ = require('underscore');
var expect = require('chai').expect;

var ProxyLists = require('../../../index');

describe('source.freeproxylists', function() {

	var freeproxylists = require('../../../sources/freeproxylists');

	describe('listUrlToDataUrl(listUrl)', function() {

		it('should be a function', function() {

			expect(freeproxylists.listUrlToDataUrl).to.be.a('function');
		});

		it('should correctly convert list URLs into data URLs', function() {

			var listUrlsToDataUrls = {
				'anon/d1445543510.html': 'http://www.freeproxylists.com/load_anon_d1445543510.html',
				'elite/d1445543510.html': 'http://www.freeproxylists.com/load_elite_d1445543510.html',
				'elite/d1445464903.html': 'http://www.freeproxylists.com/load_elite_d1445464903.html'
			};

			_.each(listUrlsToDataUrls, function(dataUrl, listUrl) {
				expect(freeproxylists.listUrlToDataUrl(listUrl)).to.equal(dataUrl);
			});
		});
	});

	describe('getStartingPageUrls([options, ]cb)', function() {

		it('should be a function', function() {

			expect(freeproxylists.getStartingPageUrls).to.be.a('function');
		});

		describe('options', function() {

			describe('anonymityLevels', function() {

				it('should return transparent starting page URL', function() {

					var options = {
						anonymityLevels: ['transparent'],
						protocols: ['https']
					};

					var startingPageUrls = freeproxylists.getStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(startingPageUrls.transparent).to.not.equal(undefined);
					expect(startingPageUrls.transparent).to.be.a('string');
					expect(_.values(startingPageUrls)).to.have.length(1);
				});

				it('"socks": should return only socks starting page URL', function() {

					var options = {
						anonymityLevels: [],
						protocols: ['socks4', 'socks5']
					};

					var startingPageUrls = freeproxylists.getStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(startingPageUrls.socks).to.not.equal(undefined);
					expect(startingPageUrls.socks).to.be.a('string');
					expect(_.values(startingPageUrls)).to.have.length(1);
				});
			});

			describe('sample', function() {

				it('should return only a few starting page URLs', function() {

					var options = {
						anonymityLevels: ['transparent', 'anonymous', 'elite'],
						protocols: ['https', 'http', 'socks4', 'socks5'],
						sample: true
					};

					var startingPageUrls = freeproxylists.getStartingPageUrls(options);

					expect(startingPageUrls).to.be.an('object');
					expect(_.values(startingPageUrls).length > 0).to.equal(true);
					expect(_.values(startingPageUrls).length < 5).to.equal(true);
				});
			});
		});
	});

	describe('getListUrls([options, ]cb)', function() {

		it('should be a function', function() {

			expect(freeproxylists.getListUrls).to.be.a('function');
		});

		it('should return all proxy list URLs', function(done) {

			this.timeout(5000);

			var options = {
				anonymityLevels: ['transparent', 'anonymous', 'elite'],
				protocols: ['https', 'http', 'socks4', 'socks5']
			};

			freeproxylists.getListUrls(options, function(error, listUrls) {

				try {

					expect(error).to.equal(null);
					expect(listUrls).to.be.an('array');
					expect(listUrls.length > 4).to.equal(true);

					_.each(listUrls, function(listUrl) {
						expect(listUrl).to.be.a('string');
						expect(listUrl.length > 0).to.equal(true);
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

			expect(freeproxylists.getListData).to.be.a('function');
		});

		it('should get list data given a list URL', function(done) {

			this.timeout(5000);

			var options = {
				anonymityLevels: ['anonymous'],
				protocols: ['http'],
				sample: true
			};

			freeproxylists.getListUrls(options, function(error, listUrls) {

				if (error) {
					return done(error);
				}

				freeproxylists.getListData(listUrls.slice(0, 1), function(error, listData) {

					try {

						expect(error).to.equal(null);
						expect(listData).to.be.an('array');
						expect(listData.length > 0).to.equal(true);

						_.each(listData, function(data) {
							expect(data.url).to.be.a('string');
							expect(data.data).to.be.a('string');
							expect(data.data.length > 0).to.equal(true);
							expect(data.data.substr(0, '<?xml'.length)).to.equal('<?xml');
						});

					} catch (error) {
						return done(error);
					}

					done();
				});
			});
		});
	});

	describe('parseListData(listData, cb)', function() {

		it('should be a function', function() {

			expect(freeproxylists.parseListData).to.be.a('function');
		});

		it('should parse the XML data into a JSON array of proxies', function(done) {

			var listData = [
				{
					url: 'anon/d1445543510.html',
					data: "<?xml version=\"1.0\" encoding=\"utf-8\"?><root><quote>&lt;table style='font-family:Tahoma;font-size:8.5pt;width:468px;color:#006699;' border='0' cellspacing='5' cellpadding='3'&gt;\n		&lt;tr style='background-color:#174869;color:#000000;'&gt;&lt;th&gt;IP&lt;/th&gt;&lt;th&gt;Port&lt;/th&gt;&lt;th&gt;HTTPS&lt;/th&gt;&lt;th&gt;Latency&lt;/th&gt;&lt;th&gt;Date checked, UTC&lt;/th&gt;&lt;th&gt;Country&lt;/th&gt;&lt;/tr&gt;\n		&lt;tr style='color:#eee;'&gt;&lt;td colspan='6'&gt;Wish you had you own &lt;b&gt;private elite proxy&lt;/b&gt;? \n		Consider buying &lt;a href='http://www.proxysolutions.net/ref/24680/11110002/det.html' target='_top'&gt;paid proxy subscription&lt;/a&gt;&lt;img style='border:0' src='http://www.proxysolutions.net/affiliates/scripts/imp.php?a_aid=24680&amp;amp;a_bid=11110002&amp;amp;chan=det' width='1' height='1' alt='' /&gt; from us. \n		Our proxies are fast, secure and reliable. You will definitely love it! Give it a try!&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.123.2.42&lt;/td&gt;&lt;td&gt;8080&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;1516&lt;/td&gt;&lt;td&gt;10/22 8:47:28 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.209.64.13&lt;/td&gt;&lt;td&gt;8118&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;2287&lt;/td&gt;&lt;td&gt;10/22 8:47:26 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;234.221.233.142&lt;/td&gt;&lt;td&gt;3128&lt;/td&gt;&lt;td&gt;true&lt;/td&gt;&lt;td&gt;21714&lt;/td&gt;&lt;td&gt;10/22 8:45:58 pm&lt;/td&gt;&lt;td&gt;Slovak Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.123.124.179&lt;/td&gt;&lt;td&gt;80&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;1097&lt;/td&gt;&lt;td&gt;10/22 8:44:50 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.123.114.49&lt;/td&gt;&lt;td&gt;80&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;2123&lt;/td&gt;&lt;td&gt;10/22 8:44:49 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.123.114.36&lt;/td&gt;&lt;td&gt;80&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;1080&lt;/td&gt;&lt;td&gt;10/22 8:44:47 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;123.123.112.71&lt;/td&gt;&lt;td&gt;80&lt;/td&gt;&lt;td&gt;false&lt;/td&gt;&lt;td&gt;13617&lt;/td&gt;&lt;td&gt;10/22 8:44:46 pm&lt;/td&gt;&lt;td&gt;Czech Republic&lt;/td&gt;&lt;/tr&gt;&lt;tr&gt;&lt;td&gt;234.123.45.21&lt;/td&gt;&lt;td&gt;8081&lt;/td&gt;&lt;td&gt;true&lt;/td&gt;&lt;td&gt;9328&lt;/td&gt;&lt;td&gt;10/22 8:44:03 pm&lt;/td&gt;&lt;td&gt;Austria&lt;/td&gt;&lt;/tr&gt;&lt;/tr&gt;&lt;/table&gt;</quote></root>"
				}
			];

			freeproxylists.parseListData(listData, function(error, proxies) {

				try {

					expect(error).to.equal(null);
					expect(proxies).to.be.an('array');
					expect(proxies).to.deep.equal([
						{
							ipAddress: '123.123.2.42',
							port: 8080,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '123.209.64.13',
							port: 8118,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '234.221.233.142',
							port: 3128,
							protocols: ['https'],
							country: 'sk',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '123.123.124.179',
							port: 80,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '123.123.114.49',
							port: 80,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '123.123.114.36',
							port: 80,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '123.123.112.71',
							port: 80,
							protocols: ['http'],
							country: 'cz',
							anonymityLevel: 'anonymous'
						},
						{
							ipAddress: '234.123.45.21',
							port: 8081,
							protocols: ['https'],
							country: 'at',
							anonymityLevel: 'anonymous'
						}
					]);

				} catch (error) {
					return done(error);
				}

				done();
			});
		});
	});
});
