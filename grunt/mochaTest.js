'use strict';

module.exports = {
	benchmarks: {
		options: {
			reporter: 'spec',
			ui: 'bdd'
		},
		src: ['test/benchmarks/**/*.js']
	},
	unit: {
		options: {
			reporter: 'spec',
			ui: 'bdd'
		},
		src: ['test/unit/**/*.js']
	}
};
