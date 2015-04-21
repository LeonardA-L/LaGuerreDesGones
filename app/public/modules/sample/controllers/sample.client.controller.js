'use strict';


angular.module('sample').controller('SampleController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.howIsMyAngular = 'Ok';
	}
]);