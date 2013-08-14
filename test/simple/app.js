var express = require('express');
var shaft   = require('../../').create({
	root_dir : __dirname
});
var domainCreate = require('domain').create;

var app = express();

app.use(function(req, res, next) {
    var domain = domainCreate();
    domain.on('error', function(err) {
    	res.end(err);
    })
    domain.run(next);
});
app.use(shaft.use());
app.listen(8080);

console.log('Started on 8080');