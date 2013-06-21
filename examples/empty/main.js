var Shaft = require(__dirname + '/../src/shaft.js');

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

app.start();

app.on('error', function(err) {
	console.log('Error', err);
});