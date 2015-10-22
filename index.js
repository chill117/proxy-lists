'use strict';

var _ = require('underscore');

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
			Types of proxies to get.

			To get all proxies, regardless of type, set this option to NULL.
		*/
		types: ['http', 'https'],

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
		sourcesBlackList: null
	},

	_types: ['http', 'https', 'socks4', 'socks5'],
	_anonymityLevels: ['transparent', 'anonymous', 'elite'],
	_countries: require('./countries'),
	_sources: require('./sources'),

	// Get proxies from all sources.
	getProxies: function(options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		options = this.prepareOptions(options);

		var sources = this.listSources(options);

		async.map(sources, _.bind(function(source, next) {

			this.getProxiesFromSource(source.name, options, next);

		}, this), function(error, proxies) {

			if (error) {
				return cb(error);
			}

			// Collapse the multi-dimensional array.
			proxies = Array.prototype.concat.apply([], proxies);

			cb(null, proxies);
		});
	},

	// Get proxies from a single source.
	getProxiesFromSource: function(name, options, cb) {

		if (_.isFunction(options)) {
			cb = options;
			options = null;
		}

		if (!_.has(this._sources, name)) {
			throw new Error('Proxy source does not exist: "' + name + '"');
		}

		options = this.prepareOptions(options);

		this._sources[name].getProxies(options, cb);
	},

	addSource: function(name, source) {

		if (!_.isString(name) || name.length === 0) {
			throw new Error('Invalid source name.');
		}

		if (_.has(this._sources, name)) {
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
				homeUrl: source.homeUrl || ''
			};

		}, this);
	},

	prepareOptions: function(options) {

		options = _.extend({}, this.defaultOptions, options || {});

		if (_.isNull(options.countries)) {
			// Use all countries.
			options.countries = _.keys(this._countries);
		}

		if (_.isNull(options.types)) {
			// Use all types.
			options.types = _.values(this._types);
		}

		if (_.isNull(options.anonymityLevels)) {
			// Use all anonymity levels.
			options.anonymityLevels = _.values(this._anonymityLevels);
		}

		if (!_.isArray(options.countries) && !_.isObject(options.countries)) {
			throw new Error('Invalid option "countries": Array or object expected.');
		}

		if (!_.isArray(options.types)) {
			throw new Error('Invalid option "types": Array expected.');
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

	isValidProxy: function(proxy) {

		return !!proxy.ip_address && this.isValidIpAddress(proxy.ip_address) &&
				!!proxy.port && this.isValidPort(proxy.port) &&
				!!proxy.type && this.isValidProxyType(proxy.type);
	},

	isValidPort: function(port) {

		return parseInt(port).toString() === port.toString();
	},

	isValidProxyType: function(type) {

		return ['http', 'https', 'socks4', 'socks5'].indexOf(type) !== -1;
	},

	isValidIpAddress: function(ip_address) {

		return this.isValidIpv4Address(ip_address);
	},

	isValidIpv4Address: function(ip_address) {

		return /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip_address);
	}
};

var arrayToHash = function(array) {

	return _.object(_.map(array, function(value) {
		return [value, true];
	}));
};
