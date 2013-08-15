var _  = require('blank-js');
var fs = require('fs');

module.exports = {

	before : function() {
		this.view = {};
	},

	frontend : function(app, params) {
		this.view.requireJs = {
			app    : app,
			params : params
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