require.config({
	baseUrl: "./js/",
	paths: {
		"knockout": "./lib/knockout-2.2.1",
		"jquery": "./lib/jquery-1.10.1",
		"bootstrap": "../bootstrap/js/bootstrap-2.3.2"
	},
	shim: {
		"bootstrap": ["jquery"]
	},
	packages : [{
		name : 'css',
		location : './require-css',
		main : 'css'
	}, {
		name : 'less',
		location : './require-less',
		main : 'less'
	}]
});