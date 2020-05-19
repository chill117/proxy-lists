# proxy-lists

[![Build Status](https://travis-ci.org/chill117/proxy-lists.svg?branch=master)](https://travis-ci.org/chill117/proxy-lists)

Node.js module for getting proxies from publicly available proxy lists. Support for more than two dozen different proxy lists. You can see the full list of proxy sources [here](https://github.com/chill117/proxy-lists/tree/master/sources).

Missing a proxy list that you think should be supported? [Open an issue](https://github.com/chill117/proxy-lists/issues) to suggest it be added as a source. Or you can [add a new source](#addsource) and [create a pull request](https://github.com/chill117/proxy-lists/pulls/new) to have it added to this module.

* [Installation](#installation)
  * [Update GeoIp Database](#update-geoip-database)
* [Command-line interface](#command-line-interface)
* [API](#api)
  * [getProxies](#getproxies)
    * [Options](#options-for-getproxies-method)
    * [Proxy Object](#proxy-object)
  * [getProxiesFromSource](#getproxiesfromsource)
    * [Options](#options-for-getproxiesfromsource-method)
  * [addSource](#addsource)
  * [listSources](#listsources)
    * [Options](#options-for-listsources-method)
* [Usage with Proxy](#usage-with-proxy)
* [Contributing](#contributing)
	* [Configure Local Environment](#configure-local-environment)
	* [Tests](#tests)
* [Changelog](#changelog)
* [License](#license)
* [Funding](#funding)


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


### Update GeoIp Database

This module uses [geoip-lite](https://github.com/bluesmoon/node-geoip) to perform geoip-country lookups on IP addresses of proxies. The geoip-lite module ships with the free version of MaxMind's geoip database. This database stopped being directly included in the module due to a change on MaxMind's side - specifically with their end-user licensing agreements. So it is necessary for each end-user (that's you!) to [create their own MaxMind account](https://www.maxmind.com/en/geolite2/signup) and then [generate a license key](https://support.maxmind.com/account-faq/license-keys/how-do-i-generate-a-license-key/).

If you are using this module inside another project (via the API), use the following command to update the geoip database:
```bash
npm run update:geoip-database license_key=YOUR_LICENSE_KEY
```

If you are using the CLI:
```bash
proxy-lists updateGeoIpData --license-key YOUR_LICENSE_KEY
```


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
proxy-lists getProxies --sources-white-list="gatherproxy,sockslist"
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

// `getProxies` returns an event emitter.
ProxyLists.getProxies({
	// options
	countries: ['us', 'ca']
})
	.on('data', function(proxies) {
		// Received some proxies.
		console.log('got some proxies');
		console.log(proxies);
	})
	.on('error', function(error) {
		// Some error has occurred.
		console.log('error!', error);
	})
	.once('end', function() {
		// Done getting proxies.
		console.log('end!');
	});
```

Sample `proxies`:
```js
[
	{
		ipAddress: '123.123.2.42',
		port: 8080,
		country: 'us',
		source: 'superproxies'
	},
	{
		ipAddress: '234.221.233.142',
		port: 3128,
		country: 'cz',
		protocols: ['https'],
		source: 'someproxysource'
	},
	{
		ipAddress: '234.221.233.142',
		port: 3128,
		country: 'cz',
		anonymityLevel: 'elite',
		protocols: ['https'],
		source: 'anotherproxysource'
	}
]
```

#### Options for getProxies Method

```js
var options = {
	/*
		The filter mode determines how some options will be used to exclude proxies.

		For example if using this option `anonymityLevels: ['elite']`:
			'strict' mode will only allow proxies that have the 'anonymityLevel' property equal to 'elite'; ie. proxies that are missing the 'anonymityLevel' property will be excluded.
			'loose' mode will allow proxies that have the 'anonymityLevel' property of 'elite' as well as those that are missing the 'anonymityLevel' property.
	*/
	filterMode: 'strict',

	/*
		Options to pass to puppeteer when creating a new browser instance.
	*/
	browser: {
		headless: true,
		slowMo: 0,
		timeout: 10000,
	},

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
		Default request module options. For example you could pass the 'proxy' option in this way.

		See for more info:
		https://github.com/request/request#requestdefaultsoptions
	*/
	defaultRequestOptions: null,

	/*
		Directory from which sources will be loaded.
	*/
	sourcesDir: null,
};
```

#### Proxy Object

The proxy object has the following properties:
* __ipAddress__ - `string` The IP address of the proxy.
* __port__ - `integer` The port number of the proxy.
* __country__ - `string` [Alpha-2 country code](https://en.wikipedia.org/wiki/ISO_3166-1) of the country in which the proxy is geo-located.
* __source__ - `string` The name of the proxy list from which the proxy was gathered.
* __protocols__ - _optional_ `array` An array of protocols that the proxy supports. May contain one or more of the following:
  * __http__ - The proxy uses HTTP.
  * __https__ - The proxy uses HTTPS.
  * __socks5__ - The proxy server uses the [socks5](https://en.wikipedia.org/wiki/SOCKS#SOCKS5) protocol.
  * __socks4__ - The proxy server uses the [socks4](https://en.wikipedia.org/wiki/SOCKS#SOCKS4) protocol.
* __anonymityLevel__ - _optional_ `string` The anonymity level of the proxy. Can be any one of the following:
  * __transparent__ - The proxy does not hide the requester's IP address.
  * __anonymous__ - The proxy hides the requester's IP address, but adds headers to the forwarded request that make it clear that the request was made using a proxy.
  * __elite__ - The proxy hides the requester's IP address and does not add any proxy-related headers to the request.

The attributes marked as _optional_ above might not be given for all proxies. Some proxy lists are missing this information.

It's important to note that this module does __NOT__ verify all of the information provided by the proxy lists from which the proxies are gathered. If you need to check that proxies work, verify their anonymity level, whether or not they support tunneling; use [proxy-verifier](https://github.com/chill117/proxy-verifier).


### getProxiesFromSource

`getProxiesFromSource(name, [options])`

Gets proxies from a specific proxy list.

Usage:
```js
var ProxyLists = require('proxy-lists');

// `getProxiesFromSource` returns an event emitter.
ProxyLists.getProxiesFromSource('freeproxylists', {
	anonymityLevels: ['elite']
})
	.on('data', function(proxies) {
		// Received some proxies.
		console.log('got some proxies');
		console.log(proxies);
	})
	.on('error', function(error) {
		// Some error has occurred.
		console.log('error!', error);
	})
	.once('end', function() {
		// Done getting proxies.
		console.log('end!');
	});
```

#### Options for getProxiesFromSource Method

See [Options for getProxies Method](#options-for-getproxies-method).


### addSource

`addSource(name, source)`

Add a custom proxy source to the list of available proxies. The new proxy source will be used in addition to the existing sources, when calling `getProxies()`.

Usage:
```js
var ProxyLists = require('proxy-lists');

ProxyLists.addSource('my-custom-source', {
	homeUrl: 'https://somewhere.com',
	getProxies: function(options) {

		var emitter = options.newEventEmitter();

		_.defer(function() {
			// When an error occurs, use the 'error' event.
			// The 'error' event can be emitted more than once.
			emitter.emit('error', new Error('Something bad happened!'));

			// When proxies are ready, use the 'data' event.
			// The 'data' event can be emitted more than once.
			emitter.emit('data', proxies);

			// When done getting proxies, emit the 'end' event.
			// The 'end' event should be emitted once.
			emitter.emit('end');
		});

		// Must return an event emitter.
		return emitter;
	}
});
```

Your proxy source is required to return the following for each proxy: `ipAddress`, `port`. See [Proxy Object](#proxy-object) above for more information.

Please consider sharing your custom proxy sources by [creating a pull request](https://github.com/chill117/proxy-lists/pulls/new) to have them added to this module so that others can use them too.

#### Important Options to Note

Please note that there are a couple options that you should respect in your custom proxy source:
* **sample** - `boolean` If `options.sample` is `true` then you should do your best to make the fewest number of HTTP requests to the proxy source but still get at least some real proxies. The purpose of this option is to reduce the strain caused by this module's unit tests on each proxy sources' servers.
* **series** - `boolean` If `options.series` is `true` you should make sure that all asynchronous code in your custom source is run in series, NOT parallel. The purpose is to reduce the memory usage of the module so that it can be run in low-memory environments such as a VPS with 256MB of RAM.


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
		name: 'gatherproxy',
		homeUrl: 'http://www.gatherproxy.com'
	}
]
```

#### Options for listSources Method

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


## Usage with Proxy

It is possible to use a proxy while getting proxies, using the `"browser"` and `"defaultRequestOptions"` options. This module uses both request and puppeteer under-the-hood to scrape web pages. So you will have to configure both of those to use a proxy while getting proxies from every possible source.

Here is an example using the API:
```js
var ProxyLists = require('proxy-lists');

ProxyLists.getProxies({
	browser: {
		// arguments passed to puppeteer browser instance:
		args: [ '--proxy-server=127.0.0.1:9876' /* your proxy */ ]
	},
	defaultRequestOptions: {
		// Passed as default options to the request module.
		// Read the following for details about proxy usage and request:
		// https://github.com/request/request#proxies
		proxy: 'http://127.0.0.1:9876',
	}
})
	.on('data', function(proxies) {
		console.log(proxies);
	});
```
It is not currently possible to pass the above options via the CLI. But if you'd like to add this feature, pull requests are welcome ;)


## Contributing

There are a number of ways you can contribute:

* **Improve or correct the documentation** - All the documentation is in this `readme.md` file. If you see a mistake, or think something should be clarified or expanded upon, please [submit a pull request](https://github.com/chill117/proxy-lists/pulls/new)
* **Report a bug** - Please review [existing issues](https://github.com/chill117/proxy-lists/issues) before submitting a new one; to avoid duplicates. If you can't find an issue that relates to the bug you've found, please [create a new one](https://github.com/chill117/proxy-lists/issues).
* **Request a feature** - Again, please review the [existing issues](https://github.com/chill117/proxy-lists/issues) before posting a feature request. If you can't find an existing one that covers your feature idea, please [create a new one](https://github.com/chill117/proxy-lists/issues).
* **Fix a bug** - Have a look at the [existing issues](https://github.com/chill117/proxy-lists/issues) for the project. If there's a bug in there that you'd like to tackle, please feel free to do so. I would ask that when fixing a bug, that you first create a failing test that proves the bug. Then to fix the bug, make the test pass. This should hopefully ensure that the bug never creeps into the project again. After you've done all that, you can [submit a pull request](https://github.com/chill117/proxy-lists/pulls/new) with your changes.


### Configure Local Environment

#### Step 1: Get the Code

First, you'll need to pull down the code from GitHub:
```
git clone https://github.com/chill117/proxy-lists.git
```

#### Step 2: Install Dependencies

Second, you'll need to install the project dependencies as well as the dev dependencies. To do this, simply run the following from the directory you created in step 1:
```bash
npm install
```

### Tests

This project includes an automated regression test suite. To run the tests:
```bash
npm test
```


## Changelog

See [changelog.md](https://github.com/chill117/proxy-lists/blob/master/changelog.md)


## License

This software is [MIT licensed](https://tldrlegal.com/license/mit-license):
> A short, permissive software license. Basically, you can do whatever you want as long as you include the original copyright and license notice in any copy of the software/source.  There are many variations of this license in use.


## Funding

This project is free and open-source. If you would like to show your appreciation by helping to fund the project's continued development and maintenance, you can find available options [here](https://degreesofzero.com/donate.html?project=proxy-lists).

