var https = require('https');
var URL   = require('url');
var _     = require('blank-js');

module.exports = {
	extend : 'base',
	indexAction : function() {
		this.view.title = 'Angular';
		this.frontend('photo');
		this.render('index/index');
	},
	albumsAction : function() {
		var user = this.query.username;

		vkRequest('users', 'get', {user_ids : user}, function(err, data) {
			if (err) {
				this.rpc().error(err + '').send();
			} else {
				vkRequest('photos', 'getAlbums', {owner_id: data.shift().id, need_covers:1, photo_sizes:1}, function(err, data){
					if (err) {
						this.rpc().error(err + '').send();
					} else {
						this.rpc().ok(data.items).send();
					}
				}.bind(this));
			}
		}.bind(this));

		
	}
}


function vkRequest(method, action, params, callback) {
	if (typeof params === 'function') {
		callback = params;
		params   = {};
	}
	url = URL.format({
		protocol : 'https',
		host : 'api.vk.com',
		pathname : '/method/' + method + '.' + action,
		query : _.extend({v : '5.0'}, params)
	});
	https.request(url, function(res) {
		var data = '';
		res.on('error', function(err) {
			callback(err);
		});

		res.on('data', function(chunk) {
			data += chunk;
		});
		res.on('end', function() {
			try {
				data = JSON.parse(data);
			} catch (err) {
				callback(err);
				return;
			}
			if (data.error) {
				callback(new Error(data.error.error_code  + ' ' + data.error.error_msg || 'Unknown error'));
				return;
			}
			callback(null, data.response || {}, res);
		});
	}).end();
}