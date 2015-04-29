'use strict';


angular.module('perso').controller('PersoController', ['$scope',
															'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;


		
	}
]);
