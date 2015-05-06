'use strict';

// Setting up route
angular.module('scoreBoard').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('scoreBoard', {
			url: '/scoreBoard/:gameId',
			templateUrl: 'modules/scoreBoard/views/scoreBoard.client.view.html'
		});
	}
]);
