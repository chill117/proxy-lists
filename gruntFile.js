module.exports = function(grunt) {

	var config = {

		jscs: {
			src: [
				'sources/*.js',
				'test/**/*.js',
				'countries.js',
				'gruntFile.js',
				'index.js'
			],
			options: {
				config: '.jscsrc',
				requireCurlyBraces: [ 'if', 'for', 'while' ]
			}
		},
		mochaTest: {
			unit: {
				options: {
					reporter: 'spec',
					ui: 'bdd',
					require: [
						function() {
							_ = require('underscore');
							async = require('async');
							expect = require('chai').expect;
							ProxyLists = require('./index');
						}
					]
				},
				src: ['test/unit/**/*.js']
			},
			integration: {
				options: {
					reporter: 'spec'
				},
				src: ['test/integration/**/*.js']
			}
		}
	};

	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.initConfig(config);

	grunt.registerTask('test', [ 'jscs', 'mochaTest' ]);
	grunt.registerTask('test:unit', [ 'mochaTest:unit' ]);
	grunt.registerTask('test:integration', [ 'mochaTest:integration' ]);
};
