'use strict';

var _ = require('underscore');
var DataSourcer = require('data-sourcer');
var GeoIpNativeLite = require('geoip-native-lite');
var net = require('net');
var path = require('path');

GeoIpNativeLite.loadDataSync({ ipv4: true, ipv6: true, cache: true });

var ProxyLists = module.exports = {

	sourcer: new DataSourcer({
		getDataMethodName: 'getProxies',
		sourcesDir: process.env.PROXY_LISTS_SOURCES_DIR || path.join(__dirname, 'sources'),
	}),

	defaultOptions: {
		/*
			The filter mode determines how some options will be used to exclude proxies.

			For example if using this option `anonymityLevels: ['elite']`:
				'strict' mode will only allow proxies that have the 'anonymityLevel' property equal to 'elite'; ie. proxies that are missing the 'anonymityLevel' property will be excluded.
				'loose' mode will allow proxies that have the 'anonymityLevel' property of 'elite' as well as those that are missing the 'anonymityLevel' property.
		*/
		filterMode: 'strict',

		/*
			Get proxies for the specified countries.

			To get all proxies, regardless of country, set this option to NULL.

			See:
			https://en.wikipedia.org/wiki/ISO_3166-1

			Only USA and Canada:
			['us', 'ca']
		*/
		countries: null,

		/*
			Exclude proxies from the specified countries.

			To exclude Germany and Great Britain:
			['de', 'gb']
		*/
		countriesBlackList: null,

		/*
			Get proxies that use the specified protocols.

			To get all proxies, regardless of protocol, set this option to NULL.
		*/
		protocols: ['http', 'https'],

		/*
			Anonymity level.

			To get all proxies, regardless of anonymity level, set this option to NULL.
		*/
		anonymityLevels: ['anonymous', 'elite'],

		/*
			Load GeoIp data for these types of IP addresses. Default is only ipv4.

			To include both ipv4 and ipv6:
			['ipv4', 'ipv6']
		*/
		ipTypes: ['ipv4'],

		/*
			Include proxy sources by name.

			Only 'freeproxylists':
			['freeproxylists']
		*/
		sourcesWhiteList: null,

		/*
			Exclude proxy sources by name.

			All proxy sources except 'freeproxylists':
			['freeproxylists']
		*/
		sourcesBlackList: null,

		/*
			Set to TRUE to have all asynchronous operations run in series.
		*/
		series: false,

		/*
			Use a queue to limit the number of simultaneous HTTP requests.
		*/
		requestQueue: {
			/*
				The maximum number of simultaneous requests. Set to 0 for unlimited.
			*/
			concurrency: 0,
			/*
				The time (in milliseconds) between each request. Set to 0 for no delay.
			*/
			delay: 0,
		},

		/*
			Default request module options. For example you could pass the 'proxy' option in this way.

			See for more info:
			https://github.com/request/request#requestdefaultsoptions
		*/
		defaultRequestOptions: null
	},

	_protocols: ['http', 'https', 'socks4', 'socks5'],
	_anonymityLevels: ['transparent', 'anonymous', 'elite'],
	_countries: require('./countries'),
	_ipTypes: ['ipv4', 'ipv6'],

	// Get proxies from all sources.
	getProxies: function(options) {

		var sourcerOptions = this.toSourcerOptions(options);
		sourcerOptions.process = this.processProxy.bind(this);
		return this.sourcer.getData(sourcerOptions);
	},

	// Get proxies from a single source.
	getProxiesFromSource: function(name, options) {

		var sourcerOptions = this.toSourcerOptions(options);
		sourcerOptions.process = this.processProxy.bind(this);
		return this.sourcer.getDataFromSource(name, sourcerOptions);
	},

	processProxy: function(proxy) {
		try {
			proxy.country = GeoIpNativeLite.lookup(proxy.ipAddress);
		} catch (error) {
			return null;
		}
		return proxy;
	},

	addSource: function(name, source) {

		this.sourcer.addSource(name, source);
	},

	listSources: function(options) {

		var sourcerOptions = this.toSourcerOptions(options);
		return this.sourcer.listSources(sourcerOptions);
	},

	toSourcerOptions: function(options) {

		options = options || {};
		var sourcerOptions = _.omit(options, 'filterMode', 'countries', 'countriesBlackList', 'protocols', 'anonymityLevels', 'ipTypes');

		sourcerOptions.filter = {
			mode: options.filterMode || this.defaultOptions.filterMode,
			include: {},
			exclude: {},
		};

		_.each({
			country: 'countries',
			protocols: 'protocols',
			anonymityLevel: 'anonymityLevels',
		}, function(oldKey, newKey) {
			var optionValue = options[oldKey];
			if (!_.isUndefined(optionValue) && !_.isNull(optionValue) && _.isArray(optionValue)) {
				sourcerOptions.filter.include[newKey] = _.clone(optionValue);
			}
		});

		_.each({
			country: 'countriesBlackList',
		}, function(oldKey, newKey) {
			var optionValue = options[oldKey];
			if (!_.isUndefined(optionValue) && !_.isNull(optionValue) && _.isArray(optionValue)) {
				sourcerOptions.filter.exclude[newKey] = _.clone(optionValue);
			}
		});

		return sourcerOptions;
	},

	sourceExists: function(name) {

		return this.sourcer.sourceExists(name);
	},

	getSourceNames: function() {

		var sources = this.listSources();
		return _.map(sources, function(source) {
			return source.name;
		});
	},

	isValidProxy: function(proxy, options) {

		options = _.defaults(options || {}, {
			validateIp: true
		});

		// 'ipAddress' and 'port' are required.
		return !!proxy.ipAddress && (!options.validateIp || this.isValidIpAddress(proxy.ipAddress)) &&
				!!proxy.port && this.isValidPort(proxy.port) &&
				// 'protocols' is not required, but if it's set it should be valid.
				(_.isUndefined(proxy.protocols) || this.isValidProxyProtocols(proxy.protocols)) &&
				// 'anonymityLevel' is not required, but if it's set it should be valid.
				(_.isUndefined(proxy.anonymityLevel) || this.isValidAnonymityLevel(proxy.anonymityLevel));
	},

	isValidPort: function(port) {

		return _.isNumber(port) && parseInt(port).toString() === port.toString();
	},

	isValidProxyProtocols: function(protocols) {

		return _.isArray(protocols) && protocols.length > 0 && _.every(protocols, function(protocol) {
			return ProxyLists.isValidProxyProtocol(protocol);
		});
	},

	isValidProxyProtocol: function(protocol) {

		return _.contains(this._protocols, protocol);
	},

	isValidAnonymityLevel: function(anonymityLevel) {

		return _.isString(anonymityLevel) && _.contains(this._anonymityLevels, anonymityLevel);
	},

	isValidIpAddress: function(ipAddress) {

		return net.isIP(ipAddress) !== 0;
	}
};

// For manual testing sources:
// ProxyLists.getProxies({
// 	sourcesWhiteList: ['rosinstrument'],
// 	sample: true,
// 	series: true,
// })
// 	.on('data', console.log)
// 	.on('error', console.log)
// 	.once('end', function() {
// 		console.log('done!');
// 		process.exit();
// 	});
