#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var program = require('commander');

var pkg = require('./package.json');
var ProxyLists = require('./index');
var validOutputFormats = ['json', 'csv', 'txt'];
var proxyFieldNames = ['source', 'ipAddress', 'port', 'country', 'protocols', 'anonymityLevel'];
var sourceNames = ProxyLists.getSourceNames();

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
		'-m, --filter-mode [value]',
		'Set the filter mode [strict or loose]',
		value,
		null
	)
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
		'-C, --countries-black-list <list>',
		'Exclude proxies from these countries [de, gb, ..]',
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
		'Get proxies from these sources only [' + sourceNames.join(', ') + ']',
		list,
		null
	)
	.option(
		'-x, --sources-black-list <list>',
		'Do not get proxies from these sources [' + sourceNames.join(', ') + ']',
		list,
		null
	)
	.option(
		'-i, --ip-types <list>',
		'Accepted IP types [' + ProxyLists._ipTypes.join(', ') + ']',
		list,
		['ipv4']
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
		'Write to STDOUT instead of a file',
		value,
		false
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
		var outputFile = this.outputFile;

		if (outputFile.indexOf('/') === -1) {
			outputFile = path.join(process.cwd(), outputFile);
		}

		if (!path.extname(outputFile)) {
			outputFile = outputFile + '.' + outputFormat;
		}

		var outputStream;
		if (!stdout) {
			outputStream = fs.createWriteStream(outputFile);
		} else {
			outputFile = 'STDOUT';
			outputStream = {
				write: function(data) {
					process.stdout.write(data + '\n');
				},
				end: function(cb) {
					cb();
				},
				on: function() {},
			};
		}

		var logFile = this.logFile;

		if (logFile.indexOf('/') === -1) {
			logFile = path.join(process.cwd(), logFile);
		}

		var logStream = fs.createWriteStream(logFile);
		function log() {
			var args = Array.prototype.slice.call(arguments);
			var message = args.join(' ');
			logStream.write(message + '\n');
		}

		var numWriting = 0;
		var wroteData = false;

		function onData(data) {

			if (!_.isEmpty(data)) {
				numWriting++;
				switch (outputFormat) {
					case 'json':
						data = _.map(data, function(row) {
							return JSON.stringify(row);
						});
						outputStream.write((wroteData ? ',' : '') + data.join(','));
						break;

					case 'csv':
						data = _.map(data, function(row) {
							return _.map(proxyFieldNames, function(fieldName) {
								return _.isArray(row[fieldName]) ? row[fieldName].join('/') : row[fieldName];
							}).join(',');
						});
						outputStream.write('\n' + data.join('\n'));
						break;

					case 'txt':
						data = _.map(data, function(row) {
							return row.ipAddress + ':' + row.port;
						});
						outputStream.write((wroteData ? '\n' : '') + data.join('\n'));
						break;
				}

				numWriting--;
				wroteData = true;
			}

			tryEndOutput();
		}

		function tryEndOutput() {
			if (canEndOutput()) {
				endOutput();
			}
		}

		function canEndOutput() {
			return doneScrapingAllSources() && !isWriting();
		}

		function isWriting() {
			return numWriting > 0;
		}

		function doneScrapingAllSources() {
			return !!_.every(sources, function(source) {
				return !!sourcesDone[source.name];
			});
		}

		var startOutput = _.once(function() {
			log('Writing output to ' + outputFile);
			switch (outputFormat) {
				case 'json':
					outputStream.write('[');
					break;

				case 'csv':
					outputStream.write(proxyFieldNames.join(','));
					break;
			}
		});

		var endOutput = _.once(function() {
			log('Closing output stream...');
			switch (outputFormat) {
				case 'json':
					outputStream.write(']');
					break;
			}
			outputStream.end(function() {
				log('Output stream closed');
				log('Closing log stream...');
				if (logStream) {
					logStream.end(done);
				} else {
					done();
				}
			});
		});

		var done = _.once(function() {
			process.exit();
		});

		log('Getting proxies...');

		var options = _.pick(this, [
			'filterMode',
			'anonymityLevels',
			'countries',
			'countriesBlackList',
			'protocols',
			'sourcesWhiteList',
			'sourcesBlackList',
			'sample',
			'series',
			'ipTypes'
		]);

		var sources = ProxyLists.listSources(options);
		var sourceOptions = _.omit(options, 'sourcesWhiteList', 'sourcesBlackList');
		var sourcesDone = {};
		_.each(sources, function(source) {
			try {
				ProxyLists.getProxiesFromSource(source.name, sourceOptions)
					.on('data', onData)
					.on('error', function(error) {
						log('Error while scraping', source.name + ':', error);
					})
					.once('end', function() {
						log('Finished scraping from', source.name);
						sourcesDone[source.name] = true;
						tryEndOutput();
					});
			} catch (error) {
				log(error);
			}
		});

		startOutput();
	});

program.parse(process.argv);
