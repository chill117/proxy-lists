'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var fs = require('fs');
var net = require('net');
var path = require('path');
var spawn = require('child_process').spawn;

describe('Command-line interface', function() {

	it('--help', function(done) {

		done = _.once(done);

		var cmd = spawn('./cli.js', ['--help']);
		var stdout = '';

		cmd.stdout.on('data', function(data) {
			stdout += data.toString();
		});

		cmd.stderr.on('data', function(error) {
			done(new Error(error));
		});

		cmd.on('close', function() {
			try {
				expect(stdout.indexOf('Usage: cli [options] [command]') !== -1).to.equal(true);
			} catch (error) {
				return done(error);
			}
			done();
		});
	});

	describe('getProxies', function() {

		var outputFilePath;
		before(function() {
			outputFilePath = path.join(__dirname, '..', '..', 'proxies.txt');
		});

		var proxies;
		before(function() {
			proxies = require('../fixtures/proxies');
		});

		afterEach(function(done) {
			fs.stat(outputFilePath, function(error) {
				if (error) return done();
				fs.unlink(outputFilePath, done);
			});
		});

		it('simple usage', function(done) {

			done = _.once(done);

			var env = Object.create(process.env);
			env.PROXY_LISTS_SOURCES_DIR = path.join(__dirname, '..', 'sources');
			env.DEBUG = 'data-sourcer*';

			var cmd = spawn('./cli.js', [
				'getProxies',
				'--sources-white-list', 'cli-test'
			], { env: env });

			// When debugging, uncomment the following:
			// cmd.stdout.on('data', function(data) {
			// 	console.log(data.toString());
			// });

			cmd.stderr.on('data', function(error) {
				done(new Error(error));
			});

			cmd.on('close', function() {
				fs.readFile(outputFilePath, function(error, contents) {
					if (error) return done(error);
					var hosts = _.compact(contents.toString().split('\n'));
					expect(hosts).to.have.length(proxies.length);
					try {
						_.each(hosts, function(host) {
							if (host.indexOf(':') === -1 || !net.isIP(host.split(':')[0])) {
								throw new Error('Invalid proxy host: "' + host + '"');
							}
						});
					} catch (error) {
						return done(error);
					}
					done();
				});
			});
		});
	});
});
