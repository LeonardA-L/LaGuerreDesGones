'use strict';


angular.module('play').controller('PlayController', ['$scope', 'Authentication',
	function($scope, Authentication) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		
		$scope.game = {
			'title':'Loading...'
		};
	}
]);
