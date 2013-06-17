({
	baseUrl : "WebContent/js",
	paths : {
		requireLib : "require"
	},
	name : "main",
	out : "WebContent/js/main-built.js",
	excludeShallow: ['css/css-builder', 'less/lessc-server', 'less/lessc'],
	include : ["requireLib","css","dep"],
	mainConfigFile: 'WebContent/config.js'
})