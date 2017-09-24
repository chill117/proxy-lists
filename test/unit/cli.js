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

		it('simple usage', function(done) {

			done = _.once(done);

			var cmd = spawn('./cli.js', [
				'getProxies',
				'--sample',
				'--sources-white-list', 'freeproxylist'
			]);

			cmd.stderr.on('data', function(error) {
				done(new Error(error));
			});

			cmd.on('close', function() {
				var outputFilePath = path.join(__dirname, '..', '..', 'proxies.txt');
				fs.readFile(outputFilePath, function(error, contents) {
					if (error) return done(error);
					var hosts = contents.toString().split('\n');
					expect(hosts.length > 0).to.equal(true);
					try {
						_.each(hosts, function(host) {
							if (host.indexOf(':') === -1 || !net.isIP(host.split(':')[0])) {
								throw new Error('Invalid proxy host: "' + host + '"');
							}
						});
					} catch (error) {
						return done(error);
					}
					fs.unlink(outputFilePath, done);
				});
			});
		});
	});
});
