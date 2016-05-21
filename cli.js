#!/usr/bin/env node

'use strict';

var _ = require('underscore');
var fs = require('fs');
var program = require('commander');

var pkg = JSON.parse(fs.readFileSync(__dirname + '/package.json'));
var ProxyLists = require('.');
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
		.action(function() {

			var outputFormat = this.outputFormat;
			var outputFile = process.cwd() + '/' + this.outputFile + '.' + this.outputFormat;
			var writeStream = fs.createWriteStream(outputFile);
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

			function startOutput() {

				console.log('Writing output to ' + outputFile);

				switch (outputFormat) {

					case 'json':
						writeStream.write('[');
						break;

					case 'csv':
						writeStream.write(proxyFieldNames.join(','));
						break;
				}
			}

			function endOutput() {

				switch (outputFormat) {
					case 'json':
						writeStream.write(']');
						break;
				}

				writeStream.end();
				console.log('Done!');
			}

			startOutput = _.once(startOutput);
			endOutput = _.once(endOutput);

			console.log('Getting proxies...');

			var options = _.pick(this, [
				'anonymityLevels',
				'countries',
				'protocols',
				'sourcesWhiteList',
				'sourcesBlackList'
			]);

			var gettingProxies = ProxyLists.getProxies(options);
			gettingProxies.on('data', onData);
			gettingProxies.on('end', onEnd);
			startOutput();
		});

program.parse(process.argv);
