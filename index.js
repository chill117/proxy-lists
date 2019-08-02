'use strict';

var _ = require('underscore');
var DataSourcer = require('data-sourcer');
var GeoIpNativeLite = require('geoip-native-lite');
var net = require('net');
var path = require('path');

GeoIpNativeLite.loadDataSync({ ipv4: true, ipv6: true, cache: true });

var ProxyLists = module.exports = {

	DataSourcer: DataSourcer,

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
			Full path to the sources directory.
		*/
		sourcesDir: path.join(__dirname, 'sources'),

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
	_ipTypes: ['ipv4', 'ipv6'],

	// Sources that were added via ProxyLists.addSource(name, source)
	_sources: [],

	// Get proxies from all sources.
	getProxies: function(options) {

		options = options || {};
		var emitter = DataSourcer.prototype.prepareSafeEventEmitter();
		var onData = emitter.emit.bind(emitter, 'data');
		var onError = emitter.emit.bind(emitter, 'error');
		var onEnd = emitter.emit.bind(emitter, 'end');
		var sourcerOptions = this.toSourcerOptions(options);
		var dataSourcer = this.prepareDataSourcer(options);
		sourcerOptions.process = this.processProxy.bind(this);
		dataSourcer.getData(sourcerOptions)
			.on('data', onData)
			.on('error', onError)
			.on('end', function() {
				try {
					dataSourcer.close(function(error) {
						if (error) onError(error);
						onEnd();
					});
				} catch (error) {
					onError(error);
					return onEnd();
				}
			});

		return emitter;
	},

	// Get proxies from a single source.
	getProxiesFromSource: function(name, options) {

		options = options || {};
		var emitter = DataSourcer.prototype.prepareSafeEventEmitter();
		var onData = emitter.emit.bind(emitter, 'data');
		var onError = emitter.emit.bind(emitter, 'error');
		var onEnd = emitter.emit.bind(emitter, 'end');
		var sourcerOptions = this.toSourcerOptions(options);
		var dataSourcer = this.prepareDataSourcer(options);
		sourcerOptions.process = this.processProxy.bind(this);
		dataSourcer.getDataFromSource(name, sourcerOptions)
			.on('data', onData)
			.on('error', onError)
			.on('end', function() {
				try {
					dataSourcer.close(function(error) {
						if (error) onError(error);
						onEnd();
					});
				} catch (error) {
					onError(error);
					return onEnd();
				}
			});

		return emitter;
	},

	listSources: function(options) {

		options = options || {};
		var sourcerOptions = this.toSourcerOptions(options);
		var dataSourcer = this.prepareDataSourcer(options);
		return dataSourcer.listSources(sourcerOptions);
	},

	addSource: function(name, source, options) {

		options = options || {};
		var alreadyAdded = !!_.findWhere(this._sources, { name: name });
		if (alreadyAdded) {
			throw new Error('Source already exists: "' + name + '"');
		}
		var dataSourcer = this.prepareDataSourcer(options);
		dataSourcer.addSource(name, source);
		this._sources.push({
			name: name,
			definition: source,
		});
	},

	prepareDataSourcer: function(options) {

		options = _.defaults(options || {}, {
			getDataMethodName: 'getProxies',
			sourcesDir: path.join(__dirname, 'sources'),
		});

		var dataSourcer = new DataSourcer(options);

		_.each(this._sources, function(source) {
			dataSourcer.addSource(source.name, source.definition);
		});

		return dataSourcer;
	},

	processProxy: function(proxy) {

		try {
			proxy.country = GeoIpNativeLite.lookup(proxy.ipAddress);
		} catch (error) {
			return null;
		}

		return proxy;
	},

	toSourcerOptions: function(options) {

		options = options || {};

		var sourcerOptions = _.omit(options,
			'filterMode',
			'countries',
			'countriesBlackList',
			'protocols',
			'anonymityLevels',
			'ipTypes'
		);

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
				sourcerOptions.filter.include[newKey] = _.invoke(optionValue, 'toLowerCase');
			}
		});

		_.each({
			country: 'countriesBlackList',
		}, function(oldKey, newKey) {
			var optionValue = options[oldKey];
			if (!_.isUndefined(optionValue) && !_.isNull(optionValue) && _.isArray(optionValue)) {
				sourcerOptions.filter.exclude[newKey] = _.invoke(optionValue, 'toLowerCase');
			}
		});

		return sourcerOptions;
	},

	isValidProxy: function(proxy, options) {

		options = _.defaults(options || {}, {
			validateIp: true
		});

		// 'ipAddress' is required.
		if (!proxy.ipAddress) return false;
		// Valid 'ipAddress' is optional.
		if (options.validateIp && !this.isValidIpAddress(proxy.ipAddress)) return false;
		// 'port' is required.
		if (!proxy.port) return false;
		// Valid port is required.
		if (!this.isValidPort(proxy.port)) return false;
		// 'protocols' is not required, but if it's set it should be valid.
		if (!_.isUndefined(proxy.protocols) && !_.isNull(proxy.protocols)) {
			if (!this.isValidProxyProtocols(proxy.protocols)) return false;
		}
		// 'anonymityLevel' is not required, but if it's set it should be valid.
		if (!_.isUndefined(proxy.anonymityLevel) && !_.isNull(proxy.anonymityLevel)) {
			if (!this.isValidAnonymityLevel(proxy.anonymityLevel)) return false;
		}
		// Valid proxy.
		return true;
	},

	isValidPort: function(port) {

		return _.isNumber(port) && parseInt(port).toString() === port.toString();
	},

	isValidProxyProtocols: function(protocols) {

		return _.isArray(protocols) && _.every(protocols, function(protocol) {
			return ProxyLists.isValidProxyProtocol(protocol);
		});
	},

	isValidProxyProtocol: function(protocol) {

		return _.isString(protocol) && _.contains(this._protocols, protocol);
	},

	isValidAnonymityLevel: function(anonymityLevel) {

		return _.isString(anonymityLevel) && _.contains(this._anonymityLevels, anonymityLevel);
	},

	isValidIpAddress: function(ipAddress) {

		return net.isIP(ipAddress) !== 0;
	}
};
