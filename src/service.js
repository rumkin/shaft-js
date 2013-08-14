var occur = require('occur');
var _     = require('blank-js');

function Service(app, config) {
	occur.call(this);
	this.config = _.extendDeep({}, this.config, config);
	this.init(config);
}

Service.prototype.config = {};

Service.prototype.ready = false;

Service.prototype.init = function(config) {
	this.ready = true;
};

Service.prototype.on      = occur.on;
Service.prototype.off     = occur.off;
Service.prototype.trigger = occur.trigger;

Service.create = function(app, config) {
	return new this(app, config);
}

module.exports = Service;