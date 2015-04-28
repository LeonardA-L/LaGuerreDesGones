'use strict';


angular.module('createGame').controller('CreateGameController', ['$scope',
																'Authentication',
																'$http',
	function($scope, Authentication, $http) {
		console.log($scope);
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.newGame = {
			'startTime' : Math.floor(new Date().getTime()) + 3600000,
			'title':''
		};

		$scope.createGame = function(){
			console.log('Asking for game creation');
			$http.post('/services/game/create', $scope.newGame).
			  //success(function(data, status, headers, config) {
			  success(function(data) {
				console.log('returned success '+data.success);
			  }).
			  error(function(data) {
			    console.log('error');
			  });
		};
	}
]);
