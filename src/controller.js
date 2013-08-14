var _   = require('blank-js');
var URL = require('url');

function Controller(app, options) {
	this.app     = app;
	this.options = options;
}

Controller.prototype.request = function(req, res, next) {
	this.req     = req;
	this.res     = res;
	this.next    = next;
	this.url     = URL.parse(req.url, true);
	this.query   = this.url.query;
	this.headers = this.req.headers;
	this.before();

	// route action
	var action = req.url.split(/\//).slice(2).shift() || 'index';
	var method = _.toCamelCase(action) + 'Action';
	if ( typeof this[method] !== 'function') {
		return next();
	}
	try {
		this[method]();
	} catch (err) {
		next(err);
	}
};

Controller.prototype.before = function() {};

Controller.prototype.getService = function(module, callback) {
	return this.app.getService(module, callback);
};

Controller.extend = function(object) {
	var that = this;
	var fn = function() {
		that.apply(this, arguments);
	}

	fn.prototype.__proto__ = this.prototype;
	_.extend(fn.prototype, object);
	_.extend(fn, this);
	
	// Extend options object
	fn.options = fn.prototype.options = _.extend({}, this.prototype.options, object.options);

	return fn;
};

Controller.create = function(app, options) {
	return new this(app, options);
}

module.exports = Controller;