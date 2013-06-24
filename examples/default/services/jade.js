var jade = require('jade');
var fs   = require('fs');
var path = require('path');


module.exports = {

	onInit : function() {
		this._helpers = {};
		this.trigger('init', this);
	},

	addHelper : function (name, fn) {
		this.helpers[name] = fn;
	},

	render : function(file, variables, callback) {
		var filename;

		filename = path.join(this.app.config.basedir, this.app.config.views, file + '.jade');
		fs.readFile(filename, 'utf8', function (err, data){
			if (err) return callback(err);

			var compiled, html, options, locals;

			options = this._extend({}, this.options, {
				filename : file
			});

			try {
				compiled  = jade.compile(data.toString(), this.options);
				variables = this._extend({}, this._helpers, variables, {
					basedir : this.app.config.basedir + '/' + this.app.config.views
				});

				html = compiled(variables);
				callback(null, html);
			} catch (err) {
				callback(err);
			}

		}.bind(this));
	}
}