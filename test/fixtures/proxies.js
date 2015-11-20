'use strict';

module.exports = [
	{
		ip_address: '127.0.0.1',
		port: 80,
		protocols: ['http'],
		country: 'ca',
		anonymityLevel: 'transparent'
	},
	{
		ip_address: '127.22.231.1',
		port: 8080,
		protocols: ['https'],
		country: 'us',
		anonymityLevel: 'anonymous'
	},
	{
		ip_address: '25.26.27.28',
		port: 443,
		protocols: ['https'],
		country: 'us',
		anonymityLevel: 'elite'
	},
	{
		ip_address: '255.255.255.255',
		port: 1080,
		protocols: ['socks4'],
		country: 'sk',
		anonymityLevel: 'anonymous'
	},
	{
		ip_address: '192.168.1.1',
		port: 10800,
		protocols: ['socks5'],
		country: 'fr',
		anonymityLevel: 'anonymous'
	}
];
