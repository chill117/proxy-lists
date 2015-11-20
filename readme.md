# proxy-lists

Get proxies from publicly available proxy lists.

[![Build Status](https://travis-ci.org/chill117/proxy-lists.svg?branch=master)](https://travis-ci.org/chill117/proxy-lists) [![Status of Dependencies](https://david-dm.org/chill117/proxy-lists.svg)](https://david-dm.org/chill117/proxy-lists)


## Supported Proxy Lists

* [freeproxylist](http://free-proxy-list.net/)
* [freeproxylists](http://www.freeproxylists.com/)
* [hidemyass](http://proxylist.hidemyass.com/)
* [kingproxies](http://kingproxies.com/)
* proxies24 - [http](http://proxyserverlist-24.blogspot.com/), [https](http://sslproxies24.blogspot.com/), [socks](http://vip-socks24.blogspot.com/)


## Installation

Add to your application via `npm`:
```
npm install proxy-lists --save
```
This will install `proxy-lists` and add it to your application's `package.json` file.


## How to Use

* [getProxies](#getproxies)
* [getProxiesFromSource](#getproxiesfromsource)
* [addSource](#addsource)
* [listSources](#listsources)
* [Proxy Object](#proxy-object)

### getProxies

`getProxies([options, ]cb)`

Gets proxies from all available proxy lists.

Usage:
```js
var ProxyLists = require('proxy-lists');

ProxyLists.getProxies({ countries: ['us', 'ca'] }, function(error, proxies) {
	// ..
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
	sourcesBlackList: null
};
```

### getProxiesFromSource

`getProxiesFromSource(name, [options, ]cb)`

Gets proxies from a specific proxy list.

Usage:
```js
var ProxyLists = require('proxy-lists');

ProxyLists.getProxiesFromSource('freeproxylists', { anonymityLevels: ['elite'] }, function(error, proxies) {
	// ..
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
	anonymityLevels: ['anonymous', 'elite']
};
```

### addSource

`addSource(name, source)`

Add a custom proxy source to the list of available proxies. The new proxy source will be used in addition to the existing sources, when calling `getProxies()`.

Usage:
```js
var ProxyLists = require('proxy-lists');

ProxyLists.addSource('my-custom-source', {
  homeUrl: 'https://somewhere.com',
  getProxies: function(options, cb) {
  
    // If an error occurs, call `cb` with the error as the first argument:
    cb(new Error('Something bad happened!'));

    // For success, call `cb` with NULL as the first argument and an array of proxies as the second:
    cb(null, proxies);
  }
});
```

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


### Proxy Object

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

* v1.3.0:
  * Removed attribute `proxy.protocol` in favor of `proxy.protocols` (an array of all supported protocols).
  * Renamed attribute `proxy.ip_address` to `proxy.ipAddress` for consistency.
  * Added attribute `proxy.source`.
