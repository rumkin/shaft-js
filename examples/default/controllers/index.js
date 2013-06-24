var shaft = require('shaft-js');

module.exports = shaft.controller({
	onInit : function() {
		this.vars.title = 'Index';
	},

	indexAction : function() {
		this.send(200, 'OK');
	},

	renderAction : function() {
		this.render('test');
	}
})