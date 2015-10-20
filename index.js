'use strict';

var _ = require('underscore');

var defaultOptions = {

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

		All types:
		['http', 'https', 'socks4', 'socks5']
	*/
	types: ['http', 'https'],

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
};

var ProxyLists = module.exports = {

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

		options = _.extend({}, defaultOptions, options || {});

		if (options.countries) {

			var countriesOptionHash = arrayToHash(options.countries);

			options.countries = _.filter(this._countries, function(name, code) {
				return countriesOptionHash[code];
			});
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
