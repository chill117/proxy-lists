"use strict";

var _ = require('underscore')

var convert = {
	anonymityLevels: {
		"high anonymity": "elite",
		anonymous: "anonymous",
		transparent: "transparent"
	},
	protocols: {
		http: "http",
		https: "https",
		socks4: "socks4",
		socks5: "socks5"
	}
};

module.exports = {
	homeUrl: "http://free-proxy.cz/en/",
	abstract: "list-crawler",
	defaultOptions: {
		defaultTimeout: 10000
	},
	config: {
		lists: [
			{
				link: {
					url: "http://free-proxy.cz/en/"
				},
				items: [
					{
						selector: "table#proxy_list tbody tr",
						attributes: [
							{
								name: "ipAddress",
								selector: "td:nth-child(1)",
								parse: function (text) {
									if (!text) return null;
									var regex = /\d+(\.\d+)+/;
									var match = text.match(regex);
									return match && match[0] || null;
								}
							},
							{
								name: "port",
								selector: "td:nth-child(2)",
								parse: function (text) {
									var port = parseInt(text);
									if (_.isNaN(port)) return null;
									return port;
								}
							},
							{
								name: "protocols",
								selector: "td:nth-child(3)",
								parse: function (text) {
									if (!text) return null;
									text = text.trim().toLowerCase();
									var protocol = convert.protocols[text] || 'http';
									return [protocol];
								}
							},
							{
								name: "anonymityLevel",
								selector: "td:nth-child(7)",
								parse: function (text) {
									if (!text) return null;
									text = text.trim().toLowerCase();
									return convert.anonymityLevels[text] || null;
								}
							}
						]
					}
				],
				pagination: {
					next: {
						selector: "div.paginator a:last-child"
					}
				}
			}
		]
	}
};
