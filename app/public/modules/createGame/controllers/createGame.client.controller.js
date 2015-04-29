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
			'title':'',
			'maxPlayers' : '',
			'minPlayers' : ''
		};

		$scope.error = {
			'maxPlayers' : $scope.newGame.maxPlayers>6 || $scope.newGame.maxPlayers<2
		};

		$scope.createGame = function(){
			console.log('Asking for game creation');
			if($scope.newGame.maxPlayers>6 || $scope.newGame.maxPlayers<2){
					$scope.newGame.maxPlayers=5;
					console.log('Wrong max number of players');
					return;				
				}
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
