'use strict';

// Setting up route
angular.module('waitingRoom').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('join', {
			url: '/join',
			templateUrl: 'modules/waitingRoom/views/waitingRoom.client.view.html',
			access:{
				loginRequired: true
			}
		});
	}
]);
