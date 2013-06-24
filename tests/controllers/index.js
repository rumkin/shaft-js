var shaft = require('../../src/shaft');

module.exports = {
	onInit : function() {
		this.vars.title = 'Index';
	},

	indexAction : function() {
		this.defaultControllerAction();
		this.send(200, 'OK');
	},

	renderAction : function() {
		this.render('test');
	}
};