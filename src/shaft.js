var express = require('express');
var emitter = require('events').EventEmitter;
var path    = require('path');
var fs      = require('fs');
var jade    = require('fs');

// UTILS ----------------------------------------------------------------------

function extend(target, source) {
	var sources, prop;
	sources = Array.prototype.slice.call(arguments, 1);

	while(sources.length) {
		source = sources.shift();
		for (prop in source) {
			target[prop] = source[prop];
		}
	}

	return target;
}

function collectJsFiles(dir, callback) {
	var result, files, file, filename, ext, stat;

	result = [];
	files  = fs.readdirSync(dir);

	while (files.length) {
		file = files.shift();
		ext  = path.extname(file);

		if (ext !== '.js') continue;

		filename = path.join(dir, file);
		stat = fs.statSync(filename);

		if (stat.isFile()) {
			filename.basename = file;
			filename.ext      = ext;
			callback(filename);
			result.push(filename);
		}
	}

	return result;
}

// ----------------------------------------------------------------------------
//	SHAFT
// ----------------------------------------------------------------------------


function Shaft(config) {
	this.config       = config;
	this._emitter     = new emitter;
	this._controllers = {};
	this.started      = false;
	this._services    = {};
}

// EVENTS ---------------------------------------------------------------------

Shaft.prototype.on = function(event, callback) {
	this._emitter.on(event, callback);
	return this;
};

Shaft.prototype.off = function(event, callback) {
	if (arguments.length > 1) {
		this._emitter.removeListener(event, callback);
	} else {
		this._emitter.removeAllListeners(event);
	}

	return this;
};

Shaft.prototype.once = function(event, callback) {
	this._emitter.once(event, callback);
};

Shaft.prototype.trigger = function(event, arg) {
	return this._emitter.emit.apply(this._emitter, arguments);
};


// USAGE ----------------------------------------------------------------------

Shaft.prototype.start = function(configure) {
	this.started = true;
	this.initControllers();
	this.initServices();
	this.trigger('init');
	this.initServer(configure);
	this.trigger('start');
};

Shaft.prototype.initControllers = function() {
	var dir, files, file, filepath, controller, ext, name;

	dir = path.join(this.config.basedir, this.config.controllers);
	files = fs.readdirSync(dir);

	while (files.length) {
		file = files.shift();
		ext  = path.extname(file);

		if (ext !== '.js') continue;

		name = file.substr(0, file.length - ext.length);
		controller = require(dir + '/' + file);

		if (typeof controller === 'object') {
			controller = createController(controller);
		}

		this._controllers[name] = controller;
	}
};

Shaft.prototype.initServices = function() {
	var services, service, name, options;
	services = this.config.services;

	for (name in services) {
		options = services[name];

		if (options === false) continue;

		this.initService(name, options);
	}

};

Shaft.prototype.service = function(name, options, callback) {
	if (this._services.hasOwnProperty(name)) {
		throw new Error('Service ' + name + ' already initiated');
	}

	if (typeof options === 'function') {
		callback = options;
		options  = true;
	}

	if (typeof callback === 'function') {
		this.once(name + '.init', callback);
	}

	if (this.started) {
		this.initService(name, options);
	} else {
		this.config.services[name] = options;
	}
};

Shaft.prototype.initService = function(name, options) {
	var type, location, service;
	
	type     = options.service || name;
	location = path.join(this.config.basedir, this.config.service_dir, type);
	service  = require(location);

	if (typeof service === 'object') {
		service = createService(service);
	}

	if (typeof options === 'boolean') {
		options = {}
	}

	options._name = name;

	this._services[name] = true;
	this[name] = new service(this, options);
};

Shaft.prototype.initServer = function(configure) {
	var config, server, statics, dir, mode;

	config = this.config;
	server = express();

	statics = config.statics.split(':');

	while (statics.length) {
		dir = statics.shift();
		if (dir.charAt(0) !== '/') {
			dir = path.join(this.config.basedir, dir);
		}
		server.use(express.static(dir));
	}

	if (typeof configure === 'function') {
		configure(this, server);
	} else {
		mode = config.mode;

		if (typeof configure[mode] === 'function') {
			configure[mode](this, server);
		}
	}

	server.use(this.onRequest.bind(this));
	server.use(this.onNotFound.bind(this));
	server.use(this.onError.bind(this));
	server.listen(config.port || 8000, config.host || 'localhost');
	console.log('Server is running...');	
};

Shaft.prototype.onRequest = function(req, res, next) {
	console.log('Request:', req.url);

	var call, controllers, controller;

	controllers = this._controllers;
	call        = convertRequest(req);
	req.params  = call.params;

	if ( ! controllers.hasOwnProperty(call.controller)) {
		next();
		return;
	}

	controller = new controllers[call.controller](this);
	controller.request(call, req, res, next);
};

Shaft.prototype.onNotFound = function(req, res, next) {
	res.send(404, 'Nothing found');
};

Shaft.prototype.onError = function(err, req, res, next) {
	this.trigger('error', err);
	next(err);
};

function convertRequest (req) {
	var parts, controller, action;

	parts = req.url.replace(/^\/+|\/$/, '').split('/');
	
	if (parts.length < 1) {
		// TODO: add config.app.defaults
		parts.push('index');
	} else if ( ! parts[0]) {
		parts[0] = 'index';
	}

	if (parts.length < 2) {
		// TODO: add config.app.defaults
		parts.push('index');
	}

	controller = toCamelCase(parts.shift());
	action     = toCamelCase(parts.shift());

	return {
		controller : controller,
		action     : action,
		params     : parts

	};
};

function toCamelCase (str) {
	return str.replace(/[-_](.)/, function(v) {
		return v[1].toUpperCase();
	});
};

// DEFAULT CONTROLLER ---------------------------------------------------------

function ShaftController(shaft) {
	this.app = shaft;
}

ShaftController.prototype.request = function(call, req, res, next) {
	var action, method, methods;

	this.req  = req;
	this.res  = res;
	this.next = next;

	action = call.action;
	methods = [];
	methods.push(req.method.toLowerCase() + action.substr(0, 1).toUpperCase() + action.substr(1) + 'Action');
	methods.push(action + 'Action');

	while (methods.length) {
		method = methods.shift();
		if (typeof this[method] === 'function') {
			this.beforeRequest();
			this[method]();
			return;
		}
	}
	
	next();
};

ShaftController.prototype.send = function() {
	this.res.send.apply(this.res, arguments);
};

ShaftController.prototype.render = function(view, data, callback) {
	if ( ! callback) {
		callback = this.onRender.bind(this);
	}

	data = extend({}, this.vars, data);
	this.app.jade.render(view, data, callback);
}

ShaftController.prototype.onRender = function(err, html) {
	if (err) {
		return this.next(err);
	}

	this.res.end(html);
};

ShaftController.prototype.onInit        = function() {};
ShaftController.prototype.beforeRequest = function() {};

function createController (controller) {
	var fn = function(app) {
		this.app  = app;
		this.vars = {};
		this.onInit();
	};

	fn.prototype.__proto__ = ShaftController.prototype;

	for(var prop in controller) {
		fn.prototype[prop] = controller[prop];
	}

	return fn;
}

// SHAFT SERVICE --------------------------------------------------------------

function ShaftService(app, options) {
	throw new Error('Shaft service is interface');
}

ShaftService.prototype.options  = {};
ShaftService.prototype._extend  = extend;
ShaftService.prototype.onInit   = function() {};
ShaftService.prototype.onStart  = function() {};
ShaftService.prototype.onStop   = function() {};
ShaftService.prototype.trigger  = function(event, arg1) {
	arguments[0] = this.options._name + '.' + event;
	return this.app.trigger.apply(this.app, arguments);
};


function createService(service) {
	var fn = function(app, options) {
		this.app     = app;
		this.options = extend({}, this.options, options);
		this.onInit();

		app.once('start', this.onStart.bind(this));
		app.once('stop', this.onStop.bind(this));
	};

	fn.prototype.__proto__ = ShaftService.prototype;
	extend(fn.prototype, service);

	return fn;
};


// ----------------------------------------------------------------------------
//	MODULE BINDINGS
// ----------------------------------------------------------------------------

module.exports.create = function(config) {
	return new Shaft(config);
};

module.exports.controller = createController;