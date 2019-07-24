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
		'http': ['http'],
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
		defaultTimeout: 5000,
	},
	abstract: 'list-crawler',
	config: {
		lists: [{
			link: {
				url: 'https://proxy-list.org/english/index.php',
			},
			items: [{
				selector: '#proxy-table .table ul',
				attributes: [
					{
						name: 'ipAddress',
						selector: 'li.proxy',
						parse: function(text) {
							var addr = parseProxyText(text);
							return addr && addr.ipAddress || null;
						},
					},
					{
						name: 'port',
						selector: 'li.proxy',
						parse: function(text) {
							var addr = parseProxyText(text);
							if (!addr || !addr.port) return null;
							var port = parseInt(addr.port);
							if (!port || _.isNaN(port)) return null;
							return port;
						},
					},
					{
						name: 'anonymityLevel',
						selector: 'li.type',
						parse: function(text) {
							if (!text) return null;
							return convert.anonymityLevels[text.trim().toLowerCase()] || null;
						},
					},
					{
						name: 'protocols',
						selector: 'li.https',
						parse: function(text) {
							if (!text) return null;
							return convert.protocols[text.trim().toLowerCase()] || null;
						},
					},
				],
			}],
			pagination: {
				next: {
					selector: '.pagination li:nth-child(2) a, .table-menu a.next',
				},
			},
		}],
	},
};

