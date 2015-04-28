'use strict';


angular.module('createGame').controller('CreateGameController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.howIsMyAngular = 'createGame';
	}
]);
