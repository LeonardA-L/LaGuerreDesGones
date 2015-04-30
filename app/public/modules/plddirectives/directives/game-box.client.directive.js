'use strict';

angular.module('plddirectives').directive('gameBox', ['$http',
	function($http) {
		return {
			templateUrl: 'modules/plddirectives/directives/game-box/game-box.html',
			scope : { data : '=',
			join : '=',
			playp : '='
			},
			restrict: 'E',
			link: function postLink(scope) {
				// Game box directive logic
				scope.load = false;
				scope.joinok = scope.join;
				scope.play = scope.playp && (new Date(scope.data.startTime)).getTime() < (new Date()).getTime();
				scope.joinGame = function(gameId){
					scope.joinok = false;
					scope.load = true;
					console.log('joining game '+gameId);
					$http.get('/services/game/'+gameId+'/join').
					  success(function(data) {
						//console.log(data.success);
						if(data.success){
							scope.joinok = false;
							scope.load = false;
						}
					  }).
					  error(function(data) {
					    console.log('error');
					  });
				};
			}
		};
	}
]);
