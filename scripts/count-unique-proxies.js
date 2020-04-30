var fs = require('fs');
var path = require('path');
var proxyListFilePath = process.argv[2] || path.join(__dirname, '..', 'proxies.txt');
var stream = fs.createReadStream(proxyListFilePath);
var map = new Map();
stream.on('data', function(chunk) {
	chunk.toString().trim().split('\n').forEach(function(proxy) {
		map.set(proxy, true);
	});
});
stream.on('end', function() {
	console.log('Downloaded ' + map.size + ' unique proxies');
	process.exit();
});
