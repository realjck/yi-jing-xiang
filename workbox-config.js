module.exports = {
	globDirectory: '.',
	globPatterns: [
		'**/*.{js,css,ttf,woff2,jpg,png,ico,svg,mp3,html,json,md}'
	],
	swDest: 'sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};