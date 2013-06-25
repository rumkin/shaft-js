var Shaft  = require('shaft-js');
var Getopt = require('node-getopt');

var getopt, options;

getopt = new Getopt([
	['H', 'host=ARG', 'hostname or ip'],
	['p', 'port=ARG', 'port number'],
	['m', 'mode=ARG', 'run mode'],
	['h', 'help', 'show help']
]).bindHelp();

getopt.setHelp('Usage:\n[[OPTIONS]]');

options = getopt.parseSystem().options;
if (options.help) {
	getopt.showHelp();
}

// Create application
var app = Shaft.create({
	mode : options.mode || 'development',
	host : options.host || 'localhost',
	port : options.port || 8000,
	dirs : {
		root  : __dirname,
		views : 'views'
	},
	services : {
		jade : true
	}
});

// Binding jade service initialization event
app.on('jade.init', function(jade) {
	console.log('Jade is ready!');
});

// Error event listener binding
app.on('error', function(err) {
	console.error('Error', err);
});

// Start server
app.start({
	// Configure server in development mode
	development : function(app, express) {
		console.log('Configure express for development mode')
	},

	// Configure server in production mode
	production  : function(app, express) {
		console.log('Configure express for production mode')
	}
});