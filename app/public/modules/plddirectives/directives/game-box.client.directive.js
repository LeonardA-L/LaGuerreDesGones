'use strict';

angular.module('plddirectives').directive('gameBox', ['$http', '$filter',
	function($http, $filter, $location) {
		return {
			templateUrl: 'modules/plddirectives/directives/game-box/game-box.html',
			scope : { data : '=',
			join : '=',
			playp : '=',
			user:'='
			},
			restrict: 'E',
			link: function postLink(scope) {
				// Game box directive logic
				scope.load = false;
				scope.joinok = scope.join;
				scope.gamejoined=false;
				scope.gameunsub=false;
scope.data.startTime=$filter('date')(scope.data.startTime,'dd/MM/yyyy HH:mm');

				scope.play = scope.playp && scope.data.isInit;
				
				scope.unsub = scope.playp && !scope.data.isInit && (scope.data.creator !== scope.user._id || scope.data.players.length===1);
				scope.joinGame = function(gameId){
					scope.joinok = false;
					scope.load = true;
					console.log('joining game '+gameId);
					$http.get('/services/game/'+gameId+'/join').
					  success(function(data) {
						//console.log(data.success);
						if(data.success){
							scope.gamejoined=true;
							scope.joinok = false;
							scope.load = false;
						}
					  }).
					  error(function(data) {
					    console.log('error');
					  });
				};

				scope.unjoinGame = function(gameId){
					scope.unsub = false;
					scope.play = false;
					scope.load = true;
					console.log('unjoining game '+gameId);
					$http.get('/services/game/'+gameId+'/unjoin').
					  success(function(data) {
						//console.log(data.success);
						if(data.success){
							scope.gameunsub=true;
							scope.play = false;
							scope.unsub = false;
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
