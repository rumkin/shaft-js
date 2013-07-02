var jade = require('jade');
var fs   = require('fs');
var path = require('path');
var _    = require('blank-js');


module.exports = {

	init : function() {
		this._helpers = {};
		this.trigger('init', this);
	},

	addHelper : function (name, fn) {
		this.helpers[name] = fn;
	},

	render : function(file, variables, callback) {
		var filename;

		filename = path.join(this.app.config.dirs.root, this.app.config.dirs.views, file + '.jade');
		fs.readFile(filename, 'utf8', function (err, data){
			if (err) return callback(err);

			var compiled, html, options, locals;

			options = _.extend({}, this.options, {
				filename : filename,
				basedir  : path.join(this.app.config.dirs.root, this.app.config.dirs.views)
			});

			try {
				compiled  = jade.compile(data.toString(), options);
				variables = _.extend({}, this._helpers, variables, {
					basedir : this.app.config.dirs.root + '/' + this.app.config.dirs.views
				});

				html = compiled(variables);
				callback(null, html);
			} catch (err) {
				callback(err);
			}

		}.bind(this));
	}
}