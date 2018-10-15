# Changelog

* v1.16.0:
  * Fixed-up several sources, getting anonymityLevel and protocols where possible.
* v1.15.0:
  * Upgraded dependencies
  * Fixed sources: hidemyname (formerly incloak), premproxy, proxydb
  * Now using [data-sourcer](https://github.com/chill117/data-sourcer) for managing sources
  * Cleaner CLI usage: Write log messages to proxy-lists.log file.
* v1.14.1:
  * Fix for regression in CLI
* v1.14.0:
  * Added options: `countriesBlackList`, `filterMode`, `defaultRequestOptions`
* v1.13.0:
  * Added source (premproxy)
  * Fixed source (proxydb)
  * Fix for blackhatworld source when last reply in thread does not contain the proxy list
  * Added another blackhatworld forum thread
* v1.12.0:
  * Added new source (coolproxy)
* v1.11.2:
  * Removed source (hidemyass)
  * Fixed source (blackhatworld)
* v1.11.1:
  * Fixed [#46](https://github.com/chill117/proxy-lists/issues/46)
  * Removed source (maxiproxies) because it no longer exists.
* v1.11.0:
  * Added new source (blackhatworld).
  * Fix for [#43](https://github.com/chill117/proxy-lists/issues/43)
* v1.10.0:
  * Added new source (maxiproxies).
  * Removed source (proxyspy) because it is no longer working.
  * Fix for [#42](https://github.com/chill117/proxy-lists/issues/42)
  * If using your own custom sources:
    * Proxy sources are now only required to provide `ipAddress` and `port`; all other fields are optional and should be provided only if known.
* v1.9.0:
  * Fixes for proxydb.
  * Removed source (proxyocean) because it no longer exists.
  * Added support for ipv6 addresses.
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
