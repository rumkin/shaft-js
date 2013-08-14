define(function(){
	function Application(controller, params) {
		console.log('Application is ready', controller);
		require([controller], function(controller) {
			new controller(document.querySelector('[ui=main]'), params);
		});
	}

	return Application;
});