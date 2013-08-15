var _    = require('blank-js');
var fs   = require('fs');
var URL  = require('url');
var path = require('path');

// Owned dependencies
var Controller = require('./controller.js');
var Service    = require('./service.js');

function Shaft(config) {
	this.config       = _.extendDeep({}, this.config, config);
	this.services     = {};
	this._controllers = {};
}

Shaft.prototype.config = {
	root_dir        : path.dirname(require.main.filename),
	controllers_dir : 'controllers',
	services_dir    : 'services',
	views_dir       : 'views',
	controllers     : {},
	services        : {}
};

Shaft.prototype.use = function() {
	return function(req, res, next) {
		var controller = this.route(req.url);
		if (controller) {
			controller.create(this, this.config.controllers[controller._name] || {}).request(req, res, next);
		} else {
			next();
		}
	}.bind(this);
};

Shaft.prototype.getService = function(name, callback) {
	if ( ! this.services.hasOwnProperty(name)) {
		var module = this.findService(name);
		try {
			if ( ! module) {
				throw new Error('Service "' + name + '" not found');
			}
			if (typeof module !== 'function') {
				throw new Error('Service is not a function');
			}

			this.services[name] = new module(this, this.config.services[name] || {});
		} catch (err) {
			if (callback) {
				return callback(err);
			} else {
				throw err;
			}

		}
	}
	var service = this.services[name];
	if (callback) {
		if (service.ready) {
			callback(null, service)
		} else {
			service.once('ready', function() {
				callback(null, service);
			});
		}
	}

	return service;
};

Shaft.prototype.findService = function(name) {
	var config = this.config;
	var locations, location, index, length, service_dir;
	service_dir = path.resolve(config.root_dir, config.services_dir);
	locations = [
		service_dir + '/' + name,
		service_dir + '/' + name + '/' + name + '.js',
		'shaft-' + name,
		__dirname + '/services/' + name
	];
	index  = -1;
	length = locations.length;
	while (++index < length) {
		location = locations[index];
		try {
			location = require.resolve(location);
		} catch (err) {
			continue;
		}
		var module = require(location);
		if (typeof module === 'object') {
			module = Service.extend(module);
		}
		return module;
	}
};

Shaft.prototype.route = function(url) {
	var path = URL.parse(url).pathname;
	var controller = path.split(/\//).slice(1).shift() || 'index';

	return this.findController(controller);
};

Shaft.prototype.getController = function(name) {
	var controller = this.findController(name);
	if ( ! controller) {
		throw new Error('Controller "' + name + '" not found');
	}
	return controller;
};

Shaft.prototype.findController = function(name) {
	var _controllers = this._controllers;
	var controller;

	if ( ! _controllers.hasOwnProperty(name)) {
		var location = path.resolve(this.config.root_dir, this.config.controllers_dir) + '/' + _.toCamelCase(name) + 'Controller.js';
		if ( ! fs.existsSync(location)) {
			_controllers[name] = false;
			return;
		} else {
			controller = require(location);
			if (typeof controller === 'object') {
				var parentController;
				if (controller.extend) {
					parentController = this.findController(controller.extend);
				} else {
					parentController = Controller;
				}
				controller = parentController.extend(controller);
			}
			controller._name = name;
			_controllers[name] = controller;
			return controller;
		}
	} else if ( ! _controllers[name]) {
		return;
	} else {
		return _controllers[name];
	}
};

module.exports = Shaft;
module.exports.Service    = require('./service.js');
module.exports.Controller = Controller;
module.exports.create = function(config) {
	return new Shaft(config);
}