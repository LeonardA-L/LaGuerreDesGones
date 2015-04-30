'use strict';

// Setting up route
angular.module('play').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('play', {
			url: '/play/:gameid',
			templateUrl: 'modules/play/views/play.client.view.html'
		});
	}
]);
