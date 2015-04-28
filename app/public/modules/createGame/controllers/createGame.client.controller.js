'use strict';


angular.module('createGame').controller('CreateGameController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.howIsMyAngular = 'createGame';
		$scope.startTime = new Date().getTime()/1000 + 3600;
	}
]);
