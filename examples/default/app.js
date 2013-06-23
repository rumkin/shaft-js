var Shaft = require('shaft-js');

var app = Shaft.create({
	mode        : 'development',
	basedir     : __dirname,
	views       : 'views',
	controllers : 'controllers',
	statics     : 'ui:public',
	service_dir : 'services',
	services    : {
		jade : true
	}
});

app.on('jade.init', function(jade) {
	console.log('Jade is ready!');
});

app.start({
	development : function(app, express) { },
	production  : function(app, express) { }
});

app.on('error', function(err) {
	console.error('Error', err);
});