var _ = require('blank-js');

module.exports = {

	before : function() {
		this.view = {};
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