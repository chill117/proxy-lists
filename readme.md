# proxy-lists

Get proxies from publicly available proxy lists.

[![Build Status](https://travis-ci.org/chill117/proxy-lists.svg?branch=master)](https://travis-ci.org/chill117/proxy-lists) [![Status of Dependencies](https://david-dm.org/chill117/proxy-lists.svg)](https://david-dm.org/chill117/proxy-lists)


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
		ip_address: '123.123.2.42',
		port: '8080',
		type: 'http',
		country: 'Somewhere'
	},
	{
		ip_address: '234.221.233.142',
		port: '3128',
		type: 'https',
		country: 'Somewhere Else'
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
		Types of proxies to get.

		To get all proxies, regardless of type, set this option to NULL.
	*/
	types: ['http', 'https'],

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
