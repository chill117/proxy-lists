# proxy-lists

Node.js module for getting proxies from publicly available proxy lists.

[![Build Status](https://travis-ci.org/chill117/proxy-lists.svg?branch=master)](https://travis-ci.org/chill117/proxy-lists) [![Status of Dependencies](https://david-dm.org/chill117/proxy-lists.svg)](https://david-dm.org/chill117/proxy-lists)


## Supported Proxy Lists

* [freeproxylist](http://free-proxy-list.net/)
* [freeproxylists](http://www.freeproxylists.com/)
* [gatherproxy](http://gatherproxy.com/)
* [hidemyass](http://proxylist.hidemyass.com/)
* [incloak](https://incloak.com/)
* proxies24 - [http](http://proxyserverlist-24.blogspot.com/), [https](http://sslproxies24.blogspot.com/), [socks](http://vip-socks24.blogspot.com/)
* [proxydb](http://proxydb.net/)
* [proxylisten](http://www.proxy-listen.de/)
* [proxyspy](http://txt.proxyspy.net/proxy.txt)
* [sockslist](http://sockslist.net/)

Proxy lists that require an API key:
* [bitproxies](https://bitproxies.eu/)
* [kingproxies](http://kingproxies.com/)

Missing a proxy list that you think should be here? [Open an issue](https://github.com/chill117/proxy-lists/issues) to suggest it be added as a source. Or you can [add a new source](#addsource) and [create a pull request](https://github.com/chill117/proxy-lists/pulls/new) to have it added to this module.


## Installation

If you wish to use this module as a [CLI tool](#command-line-interface), install it globally via npm:
```
npm install -g proxy-lists
```

Otherwise, you can add it to your existing node application like this:
```
npm install proxy-lists --save
```
This will install `proxy-lists` and add it to your application's `package.json` file.


## Usage

* [Command-line interface](#command-line-interface)
* [API](#api)
  * [getProxies](#getproxies)
    * [Proxy Object](#proxy-object)
  * [getProxiesFromSource](#getproxiesfromsource)
  * [addSource](#addsource)
  * [listSources](#listsources)


## Command-line interface

This section assumes that you have `proxy-lists` installed globally and that it is available on your current user's PATH.

To view the help screen for the CLI tool:
```
proxy-lists --help
```

To view the help screen for the `getProxies` command:
```
proxy-lists getProxies --help
```

To output the proxies in `.txt` format:
```
proxy-lists getProxies --output-format="txt"
```

To output proxies to STDOUT:
```
proxy-lists getProxies --stdout
```

To output proxies to a different file than proxies.txt:
```
proxy-lists getProxies --output-file="somefile.txt"
```

To get proxies from specific sources:
```
proxy-lists getProxies --sources-white-list="hidemyass,sockslist"
```

To get proxies from specific countries:
```
proxy-lists getProxies --countries="us,ca"
```

To get proxies with specific protocols:
```
proxy-lists getProxies --protocols="http,https"
```

To get only anonymous and elite proxies:
```
proxy-lists getProxies --anonymity-levels="anonymous,elite"
```

The output of the `getProxies` command is written to a new file (`proxies.txt`) in your current working directory.


## API

These are the public methods of the `ProxyLists` module that allow you to get proxies, add custom proxy sources, and list existing sources.

### getProxies

`getProxies([options])`

Gets proxies from all available proxy lists.

Usage:
```js
var ProxyLists = require('proxy-lists');

var options = {
	countries: ['us', 'ca']
};

// `gettingProxies` is an event emitter object.
var gettingProxies = ProxyLists.getProxies(options);

gettingProxies.on('data', function(proxies) {
	// Received some proxies.
});

gettingProxies.on('error', function(error) {
	// Some error has occurred.
	console.error(error);
});

gettingProxies.once('end', function() {
	// Done getting proxies.
});
```

Sample `proxies`:
```js
[
	{
		ipAddress: '123.123.2.42',
		port: 8080,
		protocols: ['http'],
		country: 'us',
		anonymityLevel: 'transparent'
	},
	{
		ipAddress: '234.221.233.142',
		port: 3128,
		protocols: ['https'],
		country: 'cz',
		anonymityLevel: 'elite'
	}
]
```

All available options:
```js
var options = {
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
    An array of IP types: ipv4 and/or ipv6
  */
  ipTypes: ['ipv4', 'ipv6']
};
```

#### Proxy Object

The proxy object has the following properties:
* __ipAddress__ - `string` The IP address of the proxy.
* __port__ - `integer` The port number of the proxy.
* __protocols__ - `array` An array of protocols that the proxy supports. May contain one or more of the following:
  * __http__ - The proxy uses HTTP.
  * __https__ - The proxy uses HTTPS.
  * __socks5__ - The proxy server uses the [socks5](https://en.wikipedia.org/wiki/SOCKS#SOCKS5) protocol.
  * __socks4__ - The proxy server uses the [socks4](https://en.wikipedia.org/wiki/SOCKS#SOCKS4) protocol.
* __tunnel__ - `boolean` Whether or not the proxy supports [tunneling](https://en.wikipedia.org/wiki/HTTP_tunnel) to HTTPS target URLs.
* __anonymityLevel__ - `string` The anonymity level of the proxy. Can be any one of the following:
  * __transparent__ - The proxy does not hide the requester's IP address.
  * __anonymous__ - The proxy hides the requester's IP address, but adds headers to the forwarded request that make it clear that the request was made using a proxy.
  * __elite__ - The proxy hides the requester's IP address and does not add any proxy-related headers to the request.
* __country__ - `string` [Alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1) of the country in which the proxy is geo-located.

It's important to note that this module does __NOT__ verify any of the information provided by the proxy lists from which the proxies are gathered. If you need to test proxies, verify their anonymity level, or confirm their geo-location; use [proxy-verifier](https://github.com/chill117/proxy-verifier).


### getProxiesFromSource

`getProxiesFromSource(name, [options])`

Gets proxies from a specific proxy list.

Usage:
```js
var ProxyLists = require('proxy-lists');

var options = {
	anonymityLevels: ['elite']
};

// `gettingProxies` is an event emitter object.
var gettingProxies = ProxyLists.getProxiesFromSource('freeproxylists', options);

gettingProxies.on('data', function(proxies) {
	// Received some proxies.
});

gettingProxies.on('error', function(error) {
	// Some error has occurred.
	console.error(error);
});

gettingProxies.once('end', function() {
	// Done getting proxies.
});
```

All available options:
```js
var options = {
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
		Set to TRUE to have all asynchronous operations run in series.
	*/
	series: false
};
```

### addSource

`addSource(name, source)`

Add a custom proxy source to the list of available proxies. The new proxy source will be used in addition to the existing sources, when calling `getProxies()`.

Usage:
```js
// Core nodejs module.
// See https://nodejs.org/api/events.html
var EventEmitter = require('events').EventEmitter || require('events');

var ProxyLists = require('proxy-lists');

ProxyLists.addSource('my-custom-source', {
	homeUrl: 'https://somewhere.com',
	getProxies: function(options) {

		var emitter = new EventEmitter();

		// When an error occurs, use the 'error' event.
		// The 'error' event can be emitted more than once.
		emitter.emit('error', new Error('Something bad happened!'));

		// When proxies are ready, use the 'data' event.
		// The 'data' event can be emitted more than once.
		emitter.emit('data', proxies);

		// When done getting proxies, emit the 'end' event.
		// The 'end' event should be emitted once.
		emitter.emit('end');

		// Must return an event emitter.
		return emitter;
	}
});
```

Please consider sharing your custom proxy sources by [creating a pull request](https://github.com/chill117/proxy-lists/pulls/new) to have them added to this module so that others can use them too.


### listSources

`listSources([options])`

Get list of all available proxy sources.

Usage:
```js
var ProxyLists = require('proxy-lists');

var sources = ProxyLists.listSources();
```

Sample `sources`:
```js
[
	{
		name: 'freeproxylists',
		homeUrl: 'http://www.freeproxylists.com'
	},
	{
		name: 'hidemyass',
		homeUrl: 'http://proxylist.hidemyass.com/'
	}
]
```

All available options:
```js
var options = {
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
```


## Contributing

There are a number of ways you can contribute:

* **Improve or correct the documentation** - All the documentation is in this `readme.md` file. If you see a mistake, or think something should be clarified or expanded upon, please [submit a pull request](https://github.com/chill117/proxy-lists/pulls/new)
* **Report a bug** - Please review [existing issues](https://github.com/chill117/proxy-lists/issues) before submitting a new one; to avoid duplicates. If you can't find an issue that relates to the bug you've found, please [create a new one](https://github.com/chill117/proxy-lists/issues).
* **Request a feature** - Again, please review the [existing issues](https://github.com/chill117/proxy-lists/issues) before posting a feature request. If you can't find an existing one that covers your feature idea, please [create a new one](https://github.com/chill117/proxy-lists/issues).
* **Fix a bug** - Have a look at the [existing issues](https://github.com/chill117/proxy-lists/issues) for the project. If there's a bug in there that you'd like to tackle, please feel free to do so. I would ask that when fixing a bug, that you first create a failing test that proves the bug. Then to fix the bug, make the test pass. This should hopefully ensure that the bug never creeps into the project again. After you've done all that, you can [submit a pull request](https://github.com/chill117/proxy-lists/pulls/new) with your changes.


## Tests

To run all tests:
```
grunt test
```

To run only unit tests:
```
grunt test:unit
```

To run only code-style checks:
```
grunt test:code-style
```


## Changelog

* v1.8.0:
  * Added `--stdout` option to CLI utility.
  * Fixed issues: [#35](https://github.com/chill117/proxy-lists/issues/35), [#37](https://github.com/chill117/proxy-lists/issues/37)
* v1.7.1:
  * Fixed issues: [#28](https://github.com/chill117/proxy-lists/issues/28), [#29](https://github.com/chill117/proxy-lists/issues/29)
* v1.7.0:
  * Now performing geo-ip look-up for all proxies
  * More proxy sources: gatherproxy.com, incloak.com, proxydb.net
* v1.6.0:
  * Added command-line interface.
  * Fixes for source (kingproxies).
* v1.5.1:
  * Fixes for source (hidemyass).
  * Removed geo-ip lookups from source (proxies24).
* v1.5.0:
  * Added `series` option to `ProxyLists.getProxies()` and `ProxyLists.getProxiesFromSource()`.
* v1.4.0:
  * `isValidProxy` no longer checks the `proxy.country` attribute.
  * `ProxyLists.getProxies()`, `ProxyLists.getProxiesFromSource()`, and `getProxies()` for all sources now using event emitter interface.
* v1.3.0:
  * Removed attribute `proxy.protocol` in favor of `proxy.protocols` (an array of all supported protocols).
  * Renamed attribute `proxy.ip_address` to `proxy.ipAddress` for consistency.
  * Added attribute `proxy.source`.
