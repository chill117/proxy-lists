'use strict';

var _ = require('underscore');
var async = require('async');
var EventEmitter = require('events').EventEmitter || require('events');
var request = require('request');

module.exports = {

    homeUrl: 'https://blogspot.com/',

    requiredOptions: {
    },

	getProxies: function(options) {

		options || (options = {});

		var emitter = new EventEmitter();
		var listUrls = this.prepareListUrls(options);
		var asyncMethod = options.series === true ? 'eachSeries' : 'each';

		async[asyncMethod](listUrls, _.bind(function(listUrl, next) {

			var fn = async.seq(
				this.getListHtml,
				this.parseListHtml
			);

			fn(listUrl, function(error, proxies) {

				if (error) {
					emitter.emit('error', error);
				} else {
					emitter.emit('data', proxies);
				}

				next();
			});

		}, this), function() {

			emitter.emit('end');
		});

		return emitter;
    },
    prepareListUrls: function (options) {
        return ['sslproxies24.blogspot.com', 'proxyserverlist-24.blogspot.com',
            'newfreshproxies24.blogspot.com', 'irc-proxies24.blogspot.com',
            'freeschoolproxy.blogspot.com', 'googleproxies24.blogspot.com',
            'getdailyfreshproxy.blogspot.com']
    },
	getListHtml: function(listUrl, cb) {

		request({
			method: 'GET',
			url: 'http://' + listUrl + '/feeds/posts/default'

		}, function(error, response, data) {

			if (error) {
				return cb(error);
			}

			cb(null, data);
		});
	},
  	parseListHtml: function(listHtml, cb) {
        var proxies = [];

        var reg = /\d+\.\d+\.\d+\.\d+\:\d+/g
        var matches = [], found;
        while (found = reg.exec(listHtml)) {
            var addr = found[0].split(':')
            matches.push({
                ipAddress: addr[0],
                port: addr[1],
                protocols: ['http'],
                country: 'us',
                anonymityLevel: 'transparent'
            });
        }
        cb(null, matches);
    }

};
