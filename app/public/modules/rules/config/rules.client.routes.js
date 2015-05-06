'use strict';

// Setting up route
angular.module('rules').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('rules', {
			url: '/rules',
			templateUrl: 'modules/rules/views/rules.client.view.html'
		});
	}
]);
