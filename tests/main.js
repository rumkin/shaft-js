var Shaft = require('../src/shaft');

var app = Shaft.create({
	mode        : 'development',
	basedir     : __dirname,
	views       : 'views',
	controllers : 'controllers',
	statics     : 'ui:public',
	service_dir : 'services',
	services    : {}
});

app.service('jade', function(jade){
	console.log('Jade initiated');
});

app.start({
	development : function(app, express) {
		console.log('Configure express in development mode');
	},

	production : function(app, express) {
		console.log('Configure express in production mode');
	}
});

app.on('error', function(err) {
	console.error('Error', err);
});