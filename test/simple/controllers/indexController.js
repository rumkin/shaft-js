module.exports = {
	extend : 'base',
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
		this.render('index/index');
	}
}