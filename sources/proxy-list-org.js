'use strict';

var _ = require('underscore');

var convert = {
	anonymityLevels: {
		'elite': 'elite',
		'anonymous': 'anonymous',
		'transparent': 'transparent',
	},
	protocols: {
		'https': ['https'],
		'-': ['http'],
	},
};

var parseProxyText = function(text) {
	if (!text) return null;
	var parts = text.split('\'');
	if (!parts || parts.length !== 3) return null;
	var addr = Buffer.from(parts[1], 'base64').toString('utf8');
	var match = addr.match(/([0-9.]+):([0-9]+)$/);
	if (!match || !match[1] || !match[2]) return null;
	return {
		ipAddress: match[1],
		port: match[2],
	};
};

module.exports = {
	homeUrl: 'https://proxy-list.org/',
	defaultOptions: {
		numPagesToScrape: 10,
	},
	abstract: 'scraper-paginated-list',
	config: {
		startPageUrl: 'https://proxy-list.org/english/index.php',
		selectors: {
			item: '#proxy-table .table ul',
			itemAttributes: {
				ipAddress: 'li.proxy',
				port: 'li.proxy',
				protocols: 'li.https',
				anonymityLevel: 'li.type',
			},
			nextLink: '.pagination li:nth-child(2) a, .table-menu a.next',
		},
		parseAttributes: {
			anonymityLevel: function(anonymityLevel) {
				anonymityLevel = anonymityLevel && anonymityLevel.trim().toLowerCase() || null;
				return anonymityLevel && convert.anonymityLevels[anonymityLevel] || null;
			},
			ipAddress: function(ipAddress) {
				var addr = parseProxyText(ipAddress);
				return addr && addr.ipAddress || null;
			},
			port: function(port) {
				var addr = parseProxyText(port);
				if (!addr || !addr.port) return null;
				port = parseInt(addr.port);
				if (!port || _.isNaN(port)) return null;
				return port;
			},
			protocols: function(protocols) {
				protocols = protocols && protocols.trim().toLowerCase() || null;
				return protocols && convert.protocols[protocols] || [];
			},
		},
	},
};
