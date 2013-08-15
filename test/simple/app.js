var express = require('express');
var less    = require('express-less');
var shaft   = require('../../').create({
	root_dir : __dirname,
	ui_dir   : 'ui'
});

var domainCreate = require('domain').create;
var app = express();

app.use(function(req, res, next) {
    var domain = domainCreate();
    domain.add(req);
    domain.add(res);
    domain.on('error', function(err) {
    	res.end(err);
    })
    domain.run(next);
});
app.use(less(__dirname + '/ui/'))
app.use(express.static(__dirname + '/ui/'))
app.use(shaft.use());
app.use(express.logger('short'));
app.listen(8080);

console.log('Started on 8080');