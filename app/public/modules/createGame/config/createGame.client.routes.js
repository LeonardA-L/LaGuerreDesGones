'use strict';

// Setting up route
angular.module('createGame').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('host', {
			url: '/host',
			templateUrl: 'modules/createGame/views/createGame.client.view.html',
			access:{
				requiresLogin: true
			}
		});
	}
]);
