'use strict';

var _ = require('underscore');

module.exports = {
	getProxies: function(options) {
		var emitter = options.newEventEmitter();
		_.defer(function() {
			try {
				var proxies = require('../../fixtures/proxies');
			} catch (error) {
				emitter.emit('error', error);
				emitter.emit('end');
				return;
			}
			emitter.emit('data', proxies);
			emitter.emit('end');
		});
		return emitter;
	}
};
