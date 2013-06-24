var Shaft  = require('shaft-js');
var Getopt = require('node-getopt');

var getopt, options;

getopt = new Getopt([
	['H', 'host=ARG', 'hostname or ip'],
	['p', 'port=ARG', 'port number'],
	['h', 'help', 'show help']
]).bindHelp();

getopt.setHelp('Usage:\n[[OPTIONS]]');

options = getopt.parseSystem().options;
if (options.help) {
	getopt.showHelp();
}

var app = Shaft.create({
	mode : 'development',
	host : options.host || 'localhost',
	port : options.port || 8000,
	dirs : {
		root  : __dirname,
		views : 'views'
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