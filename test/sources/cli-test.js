'use strict';

var _ = require('underscore');
var EventEmitter = require('events').EventEmitter || require('events');

module.exports = {
	getProxies: function() {
		var emitter = new EventEmitter;
		_.defer(function() {
			var proxies = require('../fixtures/proxies');
			emitter.emit('data', proxies);
			emitter.emit('end');
		});
		return emitter;
	}
};
