'use strict';

var _ = require('underscore');
var expect = require('chai').expect;
var fs = require('fs');
var net = require('net');
var path = require('path');
var spawn = require('child_process').spawn;

var helpers = require('../helpers');

describe('Command-line interface', function() {

	beforeEach(function(done) {
		helpers.createTmpDir(done);
	});

	afterEach(function(done) {
		helpers.destroyTmpDir(done);
	});

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

		var filePaths;
		var proxies;
		before(function() {
			filePaths = {
				output: path.join(helpers.directories.tmp, 'proxies.txt'),
				log: path.join(helpers.directories.tmp, 'proxy-lists.log'),
			};
			proxies = require('../fixtures/proxies');
		});

		it('simple usage', function(done) {

			done = _.once(done);

			var env = Object.create(process.env);
			env.PROXY_LISTS_SOURCES_DIR = path.join(__dirname, '..', 'sources');
			env.DEBUG = 'data-sourcer*';

			var cmd = spawn('./cli.js', [
				'getProxies',
				'--sources-white-list', 'cli-test',
				'--output-file', filePaths.output,
				'--log-file', filePaths.log,
			], { env: env });

			// When debugging, uncomment the following:
			cmd.stdout.on('data', function(data) {
				console.log(data.toString());
			});

			cmd.stderr.on('data', function(error) {
				done(new Error(error));
			});

			cmd.on('close', function() {
				fs.readFile(filePaths.output, function(error, contents) {
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
