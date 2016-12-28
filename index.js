'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');
var GeoIpNativeLite = require('geoip-native-lite');
var net = require('net');

var ProxyLists = module.exports = {

	defaultOptions: {
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
			Load GeoIp data for these types of IP addresses. Default is only ipv4.

			To include both ipv4 and ipv6:
			['ipv4', 'ipv6']
		*/
		ipTypes: ['ipv4']
	},

	_protocols: ['http', 'https', 'socks4', 'socks5'],
	_anonymityLevels: ['transparent', 'anonymous', 'elite'],
	_countries: require('./countries'),
	_sources: require('./sources'),
	_ipTypes: ['ipv4', 'ipv6'],

	// Get proxies from all sources.
	getProxies: function(options) {

		options = this.prepareOptions(options || {});

		var emitter = new EventEmitter();
		var sources = this.listSources(options);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';
		var onData = _.bind(emitter.emit, emitter, 'data');
		var onError = _.bind(emitter.emit, emitter, 'error');
		var onEnd = _.once(_.bind(emitter.emit, emitter, 'end'));

		async[asyncMethod](sources, _.bind(function(source, next) {

			try {
				var gettingProxies = this.getProxiesFromSource(source.name, options);
			} catch (error) {
				// Print the error as a warning, but continue getting proxies.
				console.warn(error.toString());
				return next();
			}

			gettingProxies.on('data', onData);
			gettingProxies.on('error', onError);
			gettingProxies.on('end', _.once(_.bind(next, undefined, null)));

		}, this), onEnd);

		return emitter;
	},

	// Get proxies from a single source.
	getProxiesFromSource: function(name, options) {

		if (!this.sourceExists(name)) {
			throw new Error('Proxy source does not exist: "' + name + '"');
		}

		options = this.prepareOptions(options || {});

		var source = this._sources[name];

		if (source.requiredOptions) {
			_.each(source.requiredOptions, function(message, key) {
				if (!options[name] || !_.isObject(options[name]) || !options[name][key]) {
					throw new Error('Missing required option (`option.' + name + '.' + key + '`): ' + message);
				}
			});
		}

		var emitter = new EventEmitter();
		var onData = _.bind(emitter.emit, emitter, 'data');
		var onError = _.bind(emitter.emit, emitter, 'error');
		var onEnd = _.once(_.bind(emitter.emit, emitter, 'end'));

		// Prepare the GeoIp data so that we can perform GeoIp look-ups later.
		GeoIpNativeLite.loadData({
			ipv4: options.ipTypes.indexOf('ipv4') !== -1,
			ipv6: options.ipTypes.indexOf('ipv6') !== -1,
			cache: true
		}, function(error) {

			if (error) {
				// Failed to load GeoIp data.
				// Emit error and end.
				onError(error);
				return onEnd();
			}

			var gettingProxies = source.getProxies(options);

			gettingProxies.on('data', function(proxies) {

				proxies || (proxies = []);

				// Add the 'source' attribute to every proxy.
				proxies = _.map(proxies, function(proxy) {
					proxy.source = name;
					proxy.country = GeoIpNativeLite.lookup(proxy.ipAddress);
					return proxy;
				});

				proxies = ProxyLists.filterProxies(proxies, options);
				onData(proxies);
			});

			gettingProxies.on('error', onError);
			gettingProxies.once('end', onEnd);
		});

		return emitter;
	},

	addSource: function(name, source) {

		if (!_.isString(name) || name.length === 0) {
			throw new Error('Invalid source name.');
		}

		if (this.sourceExists(name)) {
			throw new Error('Source already exists: "' + name + '"');
		}

		if (!_.isObject(source) || _.isNull(source)) {
			throw new Error('Expected "source" to be an object.');
		}

		if (!_.isFunction(source.getProxies)) {
			throw new Error('Source missing required "getProxies" method.');
		}

		this._sources[name] = source;
	},

	sourceExists: function(name) {

		return _.has(this._sources, name);
	},

	listSources: function(options) {

		options || (options = {});

		var sourcesWhiteList = options.sourcesWhiteList && arrayToHash(options.sourcesWhiteList);
		var sourcesBlackList = options.sourcesBlackList && arrayToHash(options.sourcesBlackList);

		// Get an array of source names filtered by the options.
		var sourceNames = _.filter(_.keys(this._sources), function(name) {

			if (sourcesWhiteList) {
				return sourcesWhiteList[name];
			}

			if (sourcesBlackList) {
				return !sourcesBlackList[name];
			}

			return true;
		});

		return _.map(sourceNames, function(name) {

			var source = this._sources[name];

			return {
				name: name,
				homeUrl: source.homeUrl || '',
				requiredOptions: source.requiredOptions || {}
			};

		}, this);
	},

	filterProxies: function(proxies, options) {

		options || (options = {});

		var countriesTest;
		var protocolsTest;
		var anonymityLevelsTest;

		if (options.countries) {

			if (_.isArray(options.countries) || !_.isObject(options.countries)) {
				throw new Error('Invalid option "countries": Object expected.');
			}

			countriesTest = options.countries;
		}

		if (options.protocols) {

			protocolsTest = arrayToHash(options.protocols);
		}

		if (options.anonymityLevels) {

			anonymityLevelsTest = arrayToHash(options.anonymityLevels);
		}

		return _.filter(proxies, function(proxy) {

			if (countriesTest && !countriesTest[proxy.country]) {
				return false;
			}

			if (anonymityLevelsTest && !anonymityLevelsTest[proxy.anonymityLevel]) {
				return false;
			}

			if (protocolsTest) {

				var hasAtLeastOnePassingProtocol = _.some(proxy.protocols, function(protocol) {
					return protocolsTest[protocol];
				});

				if (!hasAtLeastOnePassingProtocol) {
					return false;
				}
			}

			return true;
		});
	},

	prepareOptions: function(options) {

		options = _.extend({}, this.defaultOptions, options || {});

		if (_.isNull(options.countries)) {
			// Use all countries.
			options.countries = _.keys(this._countries);
		}

		if (_.isNull(options.protocols)) {
			// Use all protocols.
			options.protocols = _.values(this._protocols);
		}

		if (_.isNull(options.anonymityLevels)) {
			// Use all anonymity levels.
			options.anonymityLevels = _.values(this._anonymityLevels);
		}

		if (!_.isArray(options.countries) && !_.isObject(options.countries)) {
			throw new Error('Invalid option "countries": Array or object expected.');
		}

		if (!_.isArray(options.protocols)) {
			throw new Error('Invalid option "protocols": Array expected.');
		}

		if (!_.isArray(options.anonymityLevels)) {
			throw new Error('Invalid option "anonymityLevels": Array expected.');
		}

		if (options.countries && _.isArray(options.countries)) {

			options.countries = _.object(_.map(options.countries, function(code) {
				return [code, this._countries[code]];
			}, this));
		}

		return options;
	},

	isValidProxy: function(proxy, options) {

		options = _.defaults(options || {}, {
			validateIp: true
		});

		return !!proxy.ipAddress && (!options.validateIp || this.isValidIpAddress(proxy.ipAddress)) &&
				!!proxy.port && this.isValidPort(proxy.port) &&
				!!proxy.protocols && this.isValidProxyProtocols(proxy.protocols);
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

	isValidIpAddress: function(ipAddress) {

		return net.isIP(ipAddress) !== 0;
	}
};

var arrayToHash = function(array) {

	return _.object(_.map(array, function(value) {
		return [value, true];
	}));
};
