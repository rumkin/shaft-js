var _  = require('blank-js');
var fs = require('fs');

module.exports = {

	before : function() {
		this.view = {};
	},

	// hasRequireJsController : function() {
	// 	var controller = this.constructor._name + '/' + this.url.split('/').slice(2).shift();
	// 	var path = this.app.config.root_dir + '/' + this.app.config.ui_dir '/' + controller + '.js';

	// 	if (requirejs[controller]) {

	// 	}
	// },
	
	// Frontend controller intialization
	frontend : function(controller, params) {
		this.view.requireJs = {
			controller : controller,
			params     : params
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
	}
};