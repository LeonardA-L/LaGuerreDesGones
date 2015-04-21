'use strict';

// Setting up route
angular.module('sample').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('sample', {
			url: '/sample',
			templateUrl: 'modules/sample/views/sample.client.view.html'
		});
	}
]);