'use strict';


angular.module('play').controller('PlayController', ['$scope', 'Authentication', '$http', '$stateParams',
	function($scope, Authentication, $http, $stateParams) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.game = {
			'title':'Loading...'
		};

	    var gameId = $stateParams.gameId;
		console.log($stateParams);

		$http.get('/services/play/'+gameId+'/start').
		  //success(function(data, status, headers, config) {
		  success(function(data) {
			
			$scope.game = data.success;

			// Connection between player and hash
			for(var i=0;i<$scope.game.players.length;i++){
				$scope.game.players[$scope.game.players[i]._id] = $scope.game.players[i];
			}
			// Connection between zone and hash
			for(var i=0;i<$scope.game.zones.length;i++){
				$scope.game.zones[$scope.game.zones[i]._id] = $scope.game.zones[i];
			}
			console.log($scope.game);
		  }).
		  error(function(data) {
		    console.log('error');
		});

  		$scope.testDisp = function(){
  			var dto = {
  				'gameId':gameId,
  				'zoneAId':$scope.game.zones[0]._id,
  				'zoneBId':$scope.game.zones[1]._id,
  				'unitIds':[$scope.game.units[0]._id]
  			};
			$http.post('/services/action/disp',dto).
			//success(function(data, status, headers, config) {
			success(function(data) {
		  		console.log(data);
		  	}).
			error(function(data) {
		    	console.log('error');
			});
		};

		$scope.testSell = function(){
  			var dto = {
  				'zone':$scope.game.units[0].zone,
  				'unit':$scope.game.units[0]._id,
  				'player':$scope.game.units[0].player
  			};
			$http.post('/services/action/sell',dto).
			//success(function(data, status, headers, config) {
			success(function(data) {
		  		console.log(data);
		  	}).
			error(function(data) {
		    	console.log('error');
			});
		};


		$scope.testBuy = function(){
  			var dto = {
  				'zone':$scope.game.units[0].zone,
  				'player':$scope.game.units[0].player,
  				'newUnitType':7
  			};
			$http.post('/services/action/buy',dto).
			//success(function(data, status, headers, config) {
			success(function(data) {
		  		console.log(data);
		  	}).
			error(function(data) {
		    	console.log('error');
			});
		};
	}
]);
