var shaft = require('../../src/shaft');

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