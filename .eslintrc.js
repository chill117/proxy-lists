module.exports = {
	'extends': 'eslint:recommended',
	'rules': {
		'indent': ['error', 'tab', { 'SwitchCase': 1 }],
		'no-console': 0,
		'no-undef': 0,
		'no-unused-vars': ['error', { 'vars': 'all', 'args': 'none' }]
	}
};