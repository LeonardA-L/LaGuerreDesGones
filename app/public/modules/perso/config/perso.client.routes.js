'use strict';

// Setting up route
angular.module('perso').config(['$stateProvider', '$urlRouterProvider',
	function($stateProvider, $urlRouterProvider) {
		// Redirect to home view when route not found
		$urlRouterProvider.otherwise('/');

		// Home state routing
		$stateProvider.
		state('perso', {
			url: '/perso',
			templateUrl: 'modules/perso/views/perso.client.view.html',
			access:{
				loginRequired: true
			}
		});
	}
]);
