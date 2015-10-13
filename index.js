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

var countries = require('./countries');

var ProxyLists = module.exports = {

	sources: require('./sources'),

	// Get proxies from all sources.
	getProxies: function(options, cb) {

		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		options = this.prepareOptions(options);

		var proxySources = this.getProxySourcesFilteredByOptions(options);

		async.map(proxySources, _.bind(function(sourceName, next) {

			this.getProxiesFromSource(sourceName, options, next);

		}, this), function(error, proxies) {

			if (error) {
				return cb(error);
			}

			proxies = Array.prototype.concat.apply([], proxies);

			cb(null, proxies);
		});
	},

	// Get proxies from a single source.
	getProxiesFromSource: function(sourceName, options, cb) {

		if (typeof options === 'function') {
			cb = options;
			options = null;
		}

		if (typeof ProxyLists.sources[sourceName] === 'undefined') {
			throw new Error('Proxy source does not exist: "' + sourceName + '"');
		}

		options = this.prepareOptions(options);

		var source = ProxyLists.sources[sourceName];

		source.getProxies(options, function(error, proxies) {

			if (error) {
				return cb(error);
			}

			cb(null, proxies);
		});
	},

	getProxySourcesFilteredByOptions: function(options) {

		options || (options = {});

		var sourcesWhiteList = options.sourcesWhiteList && _.object(options.sourcesWhiteList);
		var sourcesBlackList = options.sourcesBlackList && _.object(options.sourcesBlackList);

		return _.filter(_.keys(ProxyLists.sources), function(sourceName) {

			if (sourcesWhiteList) {
				return sourcesWhiteList[sourceName];
			}

			if (sourcesBlackList) {
				return !sourcesBlackList[sourceName];
			}

			return true;
		});
	},

	addSource: function(name, source) {

		if (typeof name !== 'string' || name.length === 0) {
			throw new Error('Invalid source name.');
		}

		if (typeof ProxyLists.sources[name] !== 'undefined') {
			throw new Error('Source already exists: "' + name + '"');
		}

		if (!_.isObject(source) || _.isNull(source)) {
			throw new Error('Expected "source" to be an object.');
		}

		if (typeof source.getProxies !== 'function') {
			throw new Error('Source missing required "getProxies" method.');
		}

		ProxyLists.sources[name] = source;
	},

	getSources: function() {

		return _.map(this.sources, function(source, name) {

			return {
				name: name,
				homeUrl: source.homeUrl || ''
			};
		});
	},

	prepareOptions: function(options) {

		options = _.extend({}, defaultOptions, options || {});

		if (options.countries) {

			var countriesOptionHash = {};

			_.each(options.countries, function(code) {
				countriesOptionHash[code] = true;
			});

			options.countries = _.filter(countries, function(name, code) {
				return countriesOptionHash[code];
			});
		}

		return options;
	},

	isValidProxy: function(proxy) {

		return 	!!proxy.ip_address && this.isValidIpAddress(proxy.ip_address) &&
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
