'use strict';

angular.module('plddirectives').directive('gameBox', [
	function() {
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
				};
			}
		};
	}
]);