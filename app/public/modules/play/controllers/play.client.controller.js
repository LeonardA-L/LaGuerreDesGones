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
		  	
			console.log(data);

			$scope.game = data.success;
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
  				'player':$scope.game.units[0].player
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
