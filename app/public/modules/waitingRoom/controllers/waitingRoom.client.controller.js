'use strict';


angular.module('waitingRoom').controller('WaitingRoomController', ['$scope',
																'Authentication',
																'$http',
																'$timeout',
	function($scope, Authentication, $http, $timeout) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		var refreshRate = 10*1000;
		
		/*
		$scope.listAvailable = [{
			'startTime' : 1430234252,
			'title':'Les joyeux lyonnais',
			'creator' : 'LeonardA-L'
		},
		{
			'startTime' : 1430236252,
			'title':'Par ici les gonnettes',
			'creator' : 'LeonardA-L'
		}];
		*/

		//$scope.listAvailable = [];

		var retrieveAvailable = function(){
			console.log('retrieving available games');

			$http.get('/services/game/getWaiting').
			  //success(function(data, status, headers, config) {
			  success(function(data) {
				$scope.listAvailable = data.success;
				$timeout(retrieveAvailable,refreshRate);
			  }).
			  error(function(data) {
			    console.log('error');
			  });
		};

		retrieveAvailable();

		/*
		$scope.newGame = {
			'startTime' : Math.floor(new Date().getTime()/1000) + 3600,
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
		*/
	}
]);
