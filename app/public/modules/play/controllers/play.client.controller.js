'use strict';
/* global google */
/* global $ */

angular.module('play').controller('PlayController', ['$scope', 'Authentication', '$http', '$stateParams', '$document', 'Socket',
	function($scope, Authentication, $http, $stateParams, $document, Socket) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.game = {
			'title':'Loading...'
		};
		$scope.listUnitType = false;
	    var gameId = $stateParams.gameId;
		var map;
		console.log($stateParams);


		var processGameState = function(game){
			$scope.game = game;
			
			var i=0;
			var j=0;
			// Connection between player and hash
			for(i=0;i<$scope.game.players.length;i++){
				$scope.game.players[$scope.game.players[i]._id] = $scope.game.players[i];
				if($scope.game.players[i].user === $scope.authentication.user._id){
					$scope.player = $scope.game.players[i];
				}
			}
			// Connection between zone and hash
			for(j=0;j<$scope.game.zones.length;j++){
				$scope.game.zones[$scope.game.zones[j]._id] = $scope.game.zones[j];
			}
			for(j=0;j<$scope.game.units.length;j++){
				$scope.game.units[$scope.game.units[j]._id] = $scope.game.units[j];
			}

			for(i=0;i<$scope.game.zones.length;i++){
    			for(j=0;j<$scope.game.zones[i].units.length;j++){
    				$scope.game.zones[i].units[j] = $scope.game.units[$scope.game.zones[i].units[j]];
				}
			}
			console.log('New diff');
			console.log($scope.game);
			$scope.listUnitsByType($scope.game.units);
		};


		Socket.on(gameId+'.diff', function(diff) {
		    processGameState(diff.success);
		});

		$http.get('/services/play/'+gameId+'/start').
		  //success(function(data, status, headers, config) {
		  success(function(data) {
		  	processGameState(data.success);
			drawZoneMap($scope.game);
			console.log($scope);
		  }).
		  error(function(data) {
		    console.log('error');
		});

		$scope.listUnitsByType = function(us){
			$scope.unitsByTypeForZone = [];
			for(var j=0;j<$scope.game.matrixes.UnitData.content.length;j++){
			    $scope.unitsByTypeForZone.push([]);
			}

			for(var i=0;i<us.length;i++){
		    	$scope.unitsByTypeForZone[us[i].type].push(us[i]);
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
  				'player':$scope.game.units[0].player,
  				'game':gameId
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
  				'newUnitType':newUnitTypeN,
  				'game':gameId
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
			}
		}

		function drawZoneMap(game) {
			initMap();
			var allPolygons = [];
			var zoomBordr = new google.maps.LatLngBounds();
			for (var i = 0; i < game.zones.length; i++) { 
				var border = game.zonesDesc[game.zones[i].zoneDesc].border;
				var borderCoords = [ ];
				for (var j = 0; j < border.length; j++) { 
					var point = new google.maps.LatLng(border[j][1], border[j][0]);
					borderCoords.push(point);
					zoomBordr.extend(point);
				}
				// Close border
				borderCoords.push(borderCoords[0]);
				// Create the polygon
				var borderPolygon = new google.maps.Polygon({
					paths: borderCoords,
					strokeColor: '#333333',
					strokeOpacity: 0.65,
					strokeWeight: 2,
					fillColor: '#333333',
					fillOpacity: 0.35
				});
				borderPolygon.zoneId = game.zones[i]._id;
				borderPolygon.zoneDescId = game.zones[i].zoneDesc;
				allPolygons[borderPolygon.zoneId] = borderPolygon;
				// Listener on click
				google.maps.event.addListener(borderPolygon, 'click', onZoneClicked);
				borderPolygon.setMap(map);
			}
			// Add zones Polygons to Game variable
			game.zonesPolygons = allPolygons;
			// Center the map
			map.setCenter(zoomBordr.getCenter());
			map.fitBounds(zoomBordr); 

			colorMap();
		}

		function colorMap(){	// TODO Creation color => Grey / color
			for (var i = 0; i < $scope.game.zones.length; i++) { 
				var zone = $scope.game.zones[i];
				var polygon = $scope.game.zonesPolygons[zone._id];
				var color = 16711680/*zone.owner.color*/.toString(16);	//TODO Color
				polygon.setOptions({
					strokeColor: '#'+color,
					fillColor: '#'+color
				});
			}
		}

		$scope.resetMode=function(){
			$scope.mode = '';
			$scope.disp = {};
		};

		$scope.prepareDisp = function(){
			$scope.resetMode();
			$scope.mode='displacement';
			$scope.disp = {
				'zoneAId':$scope.game.selectedZone._id,
				'unitIds':[],
				'step':0
			};
		};

		$scope.addUnitToDisp = function(unitId){
			$scope.disp.unitIds.push(unitId);
			$scope.disp.step = 1;
		};

		$scope.validateDisp = function(){
			$scope.move($scope.disp.zoneAId,$scope.disp.zoneBId,$scope.disp.unitIds);
			$scope.resetMode();
		};

		function onZoneClicked(event){
			var that = this;
			$scope.$apply(function(){
				if($scope.mode === 'displacement' && $scope.disp.step>=1){
					$scope.disp.zoneBId = that.zoneId;
					$scope.disp.step=2;
				}
				else{
					$scope.resetMode();
					$scope.game.selectedZone = $scope.game.zones[that.zoneId];	// TODO Fix this
					//console.log($scope.game);
					$scope.listUnitsByType($scope.game.zones[that.zoneId].units);
				}
			});
		}

		$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});
		$(window).resize(function() {
			$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});
		});

		$document.ready(function() {
			//window.jQuery = jQuery;
			initMap();
		});

		// Mathou stuff
		 $scope.list1 = {title: 'AngularJS - Drag Me'};
  		$scope.list2 = {};
		

		$scope.resetMode();
	}
]);
