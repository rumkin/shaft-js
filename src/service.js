var occur = require('occur');
var _     = require('blank-js');

function Service(app, config) {
	occur.call(this);
	this.app    = app;
	this.config = _.extendDeep({}, this.config, config);
	this.init(this.config);
}

Service.prototype.config = {};

Service.prototype.ready = false;

Service.prototype.init = function(config) {
	this.ready = true;
	this.trigger('ready');
};

_.mixin(Service, occur);

Service.prototype.once = function(event, callback) {
	var that = this;
	var once = function() {
		callback.apply(null, arguments);
		that.off(event, once);
	};

	this.on(event, once);
	return this;
};

Service.create = function(app, config) {
	return new this(app, config);
}

Service.extend = function(object) {
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

module.exports = Service;