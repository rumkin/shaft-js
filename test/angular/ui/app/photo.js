var app = angular.module('photo', []);

app.config(function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
	$routeProvider
		.when('/', {controller:indexRenderCtrl, templateUrl:'index-render.html'})
		.when('/index', {controller:indexRenderCtrl, templateUrl:'index-render.html'})
		.when('/index/index', {controller:indexRenderCtrl, templateUrl:'index-index.html'})
		.when('/try/:what', {controller:tryCtrl, templateUrl:'index-try.html'})
		.when('/try/', {controller:tryCtrl, templateUrl:'index-try.html'})
		.otherwise({controller:noWayCtrl, templateUrl:'index-error.html'})
		;
});

function menuCtrl ($scope) {
	$scope.name = 'VPO';
	$scope.menu = [
		{label:'try', url:'/try'},
		{label:'404', url:'/404'},
	];
}

var cache = {};


function indexRenderCtrl($scope) {
	$scope.username = 'rumkin';
	$scope.albums   = cache.albums || [];
	$scope.getAlbums = function() {
		getJson('index', 'albums', {username:$scope.username}, function(response) {
			var albums = response.result;

			albums = albums.map(function(album) {
				album.thumb = album.sizes.filter(function(item) {
					return item.type === 'p';
				}).shift();

				return album;
			});
			cache.albums = $scope.albums = albums;
			$scope.$apply();
		})
	};
}

function tryCtrl($scope, $routeParams) {
	$scope.what = $routeParams.what || 'nothing';
}

function noWayCtrl ($scope) {
	$scope.error = {
		code    : 404,
		message : 'No such way. Go back or fuck of there!'
	};
}

function getJson(controller, action, params, callback) {
	$.getJSON('/' + controller + '/' + action, params, callback);
}

	// .factory('IndexRender', function(){
	// 	console.log(arguments);
	// })
	// .config(function($router){
	// 	$router.when('/', {controller:renderCtrl, template:'index.html'})
	// });

// function renderCtrl($scope) {
// 	$scope.name = 'Rumkin';
// }