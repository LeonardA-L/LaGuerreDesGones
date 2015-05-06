'use strict';


angular.module('scoreBoard').controller('ScoreBoardController', ['$scope',
																'Authentication',
																'$http',
																'$stateParams',
	function($scope, Authentication, $http, $stateParams) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		var gameId = $stateParams.gameId;
			$http.get('/services/game/'+gameId+'/scoreBoard').
			  success(function(data) {
				$scope.scoreBoard = data.success;
			  }).
			  error(function(data) {
			    console.log('error');
			  });
		}
]);
