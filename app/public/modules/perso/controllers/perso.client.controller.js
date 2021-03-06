'use strict';


angular.module('perso').controller('PersoController', ['$scope','Authentication','$http','$timeout',
	function($scope, Authentication, $http, $timeout) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.error=false;
		var refreshRate = 10*1000;
		var timerToDestroy;
		var retrieveAvailable = function(){
		//console.log('retrieving available games');

			$http.get('/services/game/getSubscribed').
			  //success(function(data, status, headers, config) {
			  success(function(data) {
				$scope.listAvailable = data.success;
				timerToDestroy = $timeout(retrieveAvailable,refreshRate);
			  }).
			  error(function(data) {
			    console.log('error');
				$scope.error=true;
			});
		};

		$scope.$on('$destroy', function(){
        	if(timerToDestroy)
        		$timeout.cancel(timerToDestroy);
    	});

		retrieveAvailable();
		
	}
]);
