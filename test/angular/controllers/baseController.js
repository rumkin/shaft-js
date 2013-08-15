var _  = require('blank-js');
var fs = require('fs');

module.exports = {

	before : function() {
		this.view = {};
	},
	// Frontend controller intialization
	frontend : function(module) {
		this.view.angular = {
			module : module
		};
	},

	render : function(view, data) {
		var jade = this.getService('jade');
		var filename = view || (this.constructor._name + '/index');

		data = _.extend({}, this.view, data);

		jade.render(filename, data, function(err, html) {
			if (err) {
				this.next(err);
			} else {
				this.res.end(html);
			}
		}.bind(this));
	},

	rpc : function() {
		return new RPC(function(data){
			this.res.contentType = 'application/json';
			this.res.end(data);
		}.bind(this));
	}
};

function RPC(send) {
	this.sendFn = send;
}

RPC.prototype.ok = function(data) {
	this.status = 1;
	this.result = data;
	return this;
};

RPC.prototype.error = function(code, message) {
	if (typeof code === 'number') {
		message = message || this.errors[code] || 'Unknown error';
	}
	this.error = {code:code, message:message};
	return this;
};

RPC.prototype.toString = function() {
	var result;
	if (this.status) {
		result = {
			jsonrpc : '2.0',
			result : this.result
		};
	} else {
		result = {
			jsonrpc : '2.0',
			error : this.error
		};
	}
	return JSON.stringify(result);
};

RPC.prototype.send = function() {
	this.sendFn(this.toString());
};

RPC.prototype.errors = {
	30351 : 'No message body'
}