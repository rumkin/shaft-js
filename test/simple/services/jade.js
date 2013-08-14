var fs   = require('fs');
var path = require('path');
var jade = require('jade');

module.exports = {
	init : function(config) {
		this.ready = true;
		this.trigger('ready');
	},
	render : function(view, data, callback) {
		var basedir  = path.resolve(this.app.config.root_dir, this.app.config.views_dir);
		var filename = basedir + '/' + view + '.jade';
		var options  = {
			basedir  : basedir,
			filename : filename
		};

		fs.readFile(filename, 'utf-8', function(err, source){
			if (err) return callback(err);

			try {
				var template = jade.compile(source, options);
			} catch (err) {
				callback(err);
				return;
			}
			callback(null, template(data));
		});
	}
};