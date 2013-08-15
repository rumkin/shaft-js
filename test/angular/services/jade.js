var fs   = require('fs');
var path = require('path');
var jade = require('jade');
var _    = require('blank-js');

module.exports = {
	init : function(config) {
		this.basedir = path.resolve(this.app.config.root_dir, this.app.config.views_dir);
		this.helpers_dir = this.basedir + '/helpers';

		var helpers_dir = this.helpers_dir;
		var files = fs.readdirSync(helpers_dir);
		var file, name;
		
		while (files.length) {
			file = files.shift();
			name = path.basename(file);
			if (name.substr(-3) === '.js') {
				this.initHelper(name.substr(0, name.length - 3), file);
			}
		}

		this.ready = true;
		this.trigger('ready');
	},
	initHelper : function(name, file) {
		this.helpers[name] = require(this.helpers_dir + '/' + file);
	},
	helpers : {},
	render : function(view, data, callback) {
		var basedir  = this.basedir;
		var filename = basedir + '/' + view + '.jade';
		var options  = {
			basedir  : basedir,
			filename : filename
		};
		
		var params = _.merge({}, data, {_:this.helpers});
		params._.view = data;
		
		fs.readFile(filename, 'utf-8', function(err, source){
			if (err) return callback(err);

			try {
				var template = jade.compile(source, options);
			} catch (err) {
				callback(err);
				return;
			}
			var html = '';
			try {
				html = template(params);
			} catch (err) {
				callback(err);
				return;
			}
			callback(null, html);
		});
	}
};