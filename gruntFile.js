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
					ui: 'bdd'
				},
				src: ['test/unit/**/*.js']
			}
		}
	};

	grunt.loadNpmTasks('grunt-jscs');
	grunt.loadNpmTasks('grunt-mocha-test');

	grunt.initConfig(config);

	grunt.registerTask('test:code-style', [ 'jscs' ]);
	grunt.registerTask('test:unit', [ 'mochaTest:unit' ]);
	grunt.registerTask('test', [ 'test:code-style', 'test:unit' ]);
};
