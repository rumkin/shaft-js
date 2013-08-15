module.exports = {
	extend : 'base',
	/**
	 * Default frontend application controller
	 * @type {String}
	 */
	indexAction : function() {
		this.res.end('THERE');
	},
	otherIndexAction : function() {
		setTimeout(function(){

			this.res.end('THERE IS');
			block.render();
		}.bind(this));
	},
	renderAction : function() {
		this.view.title = 'there';
		this.frontend('index/render', {
			params : true
		});
		this.render('index/index');
	}
}