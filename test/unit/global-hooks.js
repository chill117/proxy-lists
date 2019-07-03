'use strict';

var ProxyLists = require('../../index');

after(function(done) {
	if (!ProxyLists.sourcer) return done();
	ProxyLists.sourcer.close(done);
});
