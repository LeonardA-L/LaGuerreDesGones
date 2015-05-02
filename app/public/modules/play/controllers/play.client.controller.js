'use strict';
/* global Google */
/* global $ */

angular.module('play').controller('PlayController', ['$scope', 'Authentication', '$http', '$stateParams',
	function($scope, Authentication, $http, $stateParams) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.game = {
			'title':'Loading...'
		};

	    var gameId = $stateParams.gameId;
		var map;
		console.log($stateParams);

		$http.get('/services/play/'+gameId+'/start').
		  //success(function(data, status, headers, config) {
		  success(function(data) {
			
			$scope.game = data.success;
			
			var i=0;
			var j=0;
			// Connection between player and hash
			for(i=0;i<$scope.game.players.length;i++){
				$scope.game.players[$scope.game.players[i]._id] = $scope.game.players[i];
			}
			// Connection between zone and hash
			for(j=0;j<$scope.game.zones.length;j++){
				$scope.game.zones[$scope.game.zones[j]._id] = $scope.game.zones[j];
			}

			for(i=0;i<$scope.game.zones.length;i++){
    			for(j=0;j<$scope.game.zones[i].units.length;j++){
    				$scope.game.zones[i].units[j] = $scope.game.units[$scope.game.zones[i].units[j]];
				}
			}

			console.log($scope.game);
			drawZoneMap($scope.game);
			$scope.listUnitsByType($scope.game.units);

			console.log($scope);
		  }).
		  error(function(data) {
		    console.log('error');
		});

		$scope.listUnitsByType = function(us){
			$scope.listUnitType = false;

			$scope.unitsByType = [];
			for(var j=0;j<$scope.game.matrixes.UnitData.content.length;j++){
			    $scope.unitsByType.push([]);
			}

			for(var i=0;i<us.length;i++){
			    $scope.unitsByType[us[i].type].push(us[i]);
			}

			$scope.listUnitType = true;
		};

  		$scope.move = function(zoneAId,zoneBId,listUnits){
  			var dto = {
  				'gameId':gameId,
  				'zoneAId':zoneAId,
  				'zoneBId':zoneBId,
  				'unitIds':listUnits
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

		$scope.sell = function(zoneId,unitId,playerId){
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

		$scope.buy = function(zoneId, playerId, newUnitTypeN){
			console.log('Buying');
			var dto = {
  				'zone':zoneId,
  				'player':playerId,
  				'newUnitType':newUnitTypeN
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

		function initMap() {
			if (typeof map === 'undefined') {
				console.log('Init Map');
				var mapOptions = {
					zoom: 8,
					center: new google.maps.LatLng(45.753516, 4.909520)
				};
				map = new google.maps.Map(document.getElementById('game-main-panel'), mapOptions);
				console.log(map);
			}
		}

		function drawZoneMap(game) {
			initMap();
			console.log('Draw Zone');
			var allBorders = [];
			var allPolygons = [];
			for (var i = 0; i < game.zones.length; i++) { 
				var border = game.zonesDesc[game.zones[i].zoneDesc].border;
				var borderCoords = [ ];
				for (var j = 0; j < border.length; j++) { 
					borderCoords.push(new google.maps.LatLng(border[j][1], border[j][0]));
				}
				allBorders.push(borderCoords);
				borderCoords.push(borderCoords[0]);
				var borderPolygon = new google.maps.Polygon({
					paths: borderCoords,
					strokeColor: '#FF0000',
					strokeOpacity: 0.8,
					strokeWeight: 2,
					fillColor: '#FF0000',
					fillOpacity: 0.35
				});
				allPolygons[game.zones[i].zoneDesc] = borderPolygon;
				borderPolygon.setMap(map);
			}
			game["zonesPolygons"] = allPolygons;
			var zoomBordr = new google.maps.LatLngBounds();
			for (var i = 0; i < allBorders.length; i++) {
				for (var j = 0; j < allBorders[i].length; j++) {
					zoomBordr.extend(allBorders[i][j]);
				}
			}
			map.setCenter(zoomBordr.getCenter());
			map.fitBounds(zoomBordr); 

			console.log($scope.game);
		}

		$("#game-wrap-panels").css({'height':(($(window).height())-$('header').height())+'px'});
		$(window).resize(function() {
			$("#game-wrap-panels").css({'height':(($(window).height())-$('header').height())+'px'});
		});

		$( document ).ready(function() {
			initMap();
		});

	}
]);
