'use strict';


angular.module('rules').controller('rulesController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.howIsMyAngular = 'Ok';
	}
]);
