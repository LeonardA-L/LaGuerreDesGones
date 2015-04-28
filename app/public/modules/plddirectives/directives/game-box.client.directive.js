'use strict';

angular.module('plddirectives').directive('gameBox', ['$http',
	function($http) {
		return {
			templateUrl: 'modules/plddirectives/directives/game-box/game-box.html',
			scope : { data : '=',
			join : '='
			},
			restrict: 'E',
			link: function postLink(scope) {
				// Game box directive logic
				scope.howIsMyAngular = 'ok';
				console.log(scope);

				scope.joinGame = function(gameId){
					console.log('joining game '+gameId);
					$http.get('/services/game/'+gameId+'/join').
					  //success(function(data, status, headers, config) {
					  success(function(data) {
						//console.log(data.success);
					  }).
					  error(function(data) {
					    console.log('error');
					  });
				};
			}
		};
	}
]);