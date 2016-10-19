#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var fs = require('fs');
var program = require('commander');

var pkg = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
var ProxyLists = require('./index');
var validOutputFormats = ['json', 'csv', 'txt'];
var proxyFieldNames = ['source', 'ipAddress', 'port', 'country', 'protocols', 'anonymityLevel'];

function list(value) {
	return value.split(',');
}

function value(value) {
	return value;
}

program
	.version(pkg.version)
	.description(pkg.description);

program
	.command('getProxies')
		.option(
			'-a, --anonymity-levels <list>',
			'Get proxies with these anonymity levels [' + ProxyLists._anonymityLevels.join(', ') + ']',
			list,
			null
		)
		.option(
			'-c, --countries <list>',
			'Get proxies from these countries [us, ca, cz, ..]',
			list,
			null
		)
		.option(
			'-p, --protocols <list>',
			'Get proxies that support these protocols [' + ProxyLists._protocols.join(', ') + ']',
			list,
			null
		)
		.option(
			'-s, --sources-white-list <list>',
			'Get proxies from these sources only [' + _.keys(ProxyLists._sources).join(', ') + ']',
			list,
			null
		)
		.option(
			'-x, --sources-black-list <list>',
			'Do not get proxies from these sources [' + _.keys(ProxyLists._sources).join(', ') + ']',
			list,
			null
		)
		.option(
			'-f, --output-file [value]',
			'File to which the output will be written',
			value,
			'proxies'
		)
		.option(
			'-F, --output-format [value]',
			'Format in which the output will be written [' + validOutputFormats.join(', ') + ']',
			value,
			'txt'
		)
		.option(
			'--series',
			'Perform all asynchronous operations in series'
		)
		.option(
			'--sample',
			'Get a sample of proxies from each source'
		)
		.option(
			'--stdout',
			'Write to STDOUT instead of a file'
		)
		.option(
			'-l, --log-file [value]',
			'File to which will be logged when writing to stdout',
			value,
			'proxy-lists.log'
		)
		.action(function() {

			var outputFormat = this.outputFormat;
			var stdout = this.stdout;
			var outputFile = process.cwd() + '/' + this.outputFile + '.' + this.outputFormat;
			var writeStream;

			if(!stdout) {
				writeStream = fs.createWriteStream(outputFile);
			}
			else {
				outputFile = 'STDOUT';
				var logFile = process.cwd() + '/' + this.logFile;
				var logStream = fs.createWriteStream(logFile);
				writeStream = {
					write: function(data) {
						process.stdout.write(data + '\n');
					},
					end: function() {},
					on: function() {}
				};
			}

			function log(message) {
				if(stdout) {
					logStream.write(message + '\n');
				}
				else {
					console.log(message);
				}
			}

			writeStream.on('error', console.error.bind(console));
			var numWriting = 0;
			var wroteData = false;
			var ended = false;

			function onData(data) {

				if (!_.isEmpty(data)) {

					numWriting++;

					switch (outputFormat) {

						case 'json':

							data = _.map(data, function(row) {
								return JSON.stringify(row);
							});

							writeStream.write((wroteData ? ',' : '') + data.join(','));
							break;

						case 'csv':

							data = _.map(data, function(row) {
								return _.map(proxyFieldNames, function(fieldName) {
									return _.isArray(row[fieldName]) ? row[fieldName].join('/') : row[fieldName];
								}).join(',');
							});

							writeStream.write('\n' + data.join('\n'));
							break;

						case 'txt':

							data = _.map(data, function(row) {
								return row.ipAddress + ':' + row.port;
							});

							writeStream.write((wroteData ? '\n' : '') + data.join('\n'));
							break;
					}

					numWriting--;
					wroteData = true;
				}

				endIfDoneWritingData();
			}

			function onEnd() {

				ended = true;
				endIfDoneWritingData();
			}

			function endIfDoneWritingData() {

				if (ended && !numWriting) {
					endOutput();
				}
			}

			var startOutput = _.once(function() {

				log('Writing output to ' + outputFile);

				switch (outputFormat) {

					case 'json':
						writeStream.write('[');
						break;

					case 'csv':
						writeStream.write(proxyFieldNames.join(','));
						break;
				}
			});

			var endOutput = _.once(function() {

				switch (outputFormat) {
					case 'json':
						writeStream.write(']');
						break;
				}

				writeStream.end();
				log('Done!');

				if(logStream) {
					logStream.end();
				}
			});

			log('Getting proxies...');

			var options = _.pick(this, [
				'anonymityLevels',
				'countries',
				'protocols',
				'sourcesWhiteList',
				'sourcesBlackList',
				'sample',
				'series'
			]);

			var gettingProxies = ProxyLists.getProxies(options);
			gettingProxies.on('data', onData);
			gettingProxies.on('error', function(error) {
				console.error(error);
			});
			gettingProxies.on('end', onEnd);

			startOutput();
		});

program.parse(process.argv);
