var Shaft = require('../src/shaft');

var app = Shaft.create({
	mode        : 'development',
	dirs : {
		root  : __dirname,
		views : 'views'
	},
	defaultController : Shaft.createController({
		defaultControllerAction : function() {
			console.log('Hello there!');
		}
	})
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