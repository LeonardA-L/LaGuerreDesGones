'use strict';
/* global google */
/* global $ */

angular.module('play').controller('PlayController', ['$scope', 'Authentication', '$http', '$stateParams', '$document', 'Socket', '$timeout',
	function($scope, Authentication, $http, $stateParams, $document, Socket, $timeout) {
		// This provides Authentication context.
		$scope.authentication = Authentication;
		$scope.startError=false;
		$scope.moveError=false;
		$scope.sellError=false;
		$scope.buyError=false;

		$scope.game = {
			'title':'Loading...'
		};
		$scope.listUnitType = false;
	    var gameId = $stateParams.gameId;

		var map;
		var isMapInit = false;

		console.log($stateParams);

		var generationInterval = 120000;
		$scope.maxUnitPerZone = 8;


		var countdownForGenerationDestroy;
		var countdownForGeneration = function(){
			return $timeout(function(){
				var remainingS = Math.floor(($scope.game.nextRefresh - (new Date().getTime()))/1000);
				var secs = remainingS%60;
				if(secs < 10 && secs >= 0)
					secs = '0'+secs;
				var mins = (remainingS - secs)/60;
				if(mins < 10)
					mins = '0'+mins;
				if(secs < 0){
					$scope.remaining = '00:00';
				}
				else{
					$scope.remaining = ''+mins+':'+secs;
				}
				
				countdownForGenerationDestroy = countdownForGeneration();
			},500);
		};


		var processGameState = function(game){
			var selectedZone = $scope.selectedZone;
			$scope.game = game;
			$scope.selectedZone = selectedZone;
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

			for(i=0;i<$scope.game.actions.length;i++){
				if($scope.game.actions[i].type === 5){
					$scope.game.nextRefresh = (new Date($scope.game.actions[i].date).getTime());
					if(countdownForGenerationDestroy)
						$timeout.cancel(countdownForGenerationDestroy);
					countdownForGeneration();
					break;
				}
			}

			console.log('New diff');
			console.log($scope.game);

			console.log($scope.selectedZone);
			if($scope.selectedZone !== undefined){
				$scope.listUnitsByType($scope.game.zones[$scope.selectedZone._id].units);
			}

		};


		Socket.on(gameId+'.diff', function(diff) {
		    processGameState(diff.success);
		    colorMap();
		});

		$http.get('/services/play/'+gameId+'/start').
		  //success(function(data, status, headers, config) {
		  success(function(data) {
		  	processGameState(data.success);
			drawZoneMap($scope.game);
			//colorMap();
			console.log($scope);
		  }).
		  error(function(data) {
		    console.log('error');
			$scope.startError=true;
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
			$scope.moveError=true;
			});
		};

		$scope.sell = function(unitId,unitType){
  			var dto = {
  				'zone':$scope.selectedZone._id,
  				'unit':unitId,
  				'player':$scope.player._id,
  				'game':gameId
  			};
  			console.log(dto);
  			if($scope.mode==='displacement'&&$scope.unitsByTypeForZone[unitType].length <= $scope.disp.unitTypes[unitType]) {
  				$scope.lessUnitToDisplace(unitType); // à mettre dans le succes mais ça marchait pas :/
  			}
			$http.post('/services/action/sell',dto).
			//success(function(data, status, headers, config) {
			success(function(data) {
		  		console.log(data);
		  	}).
			error(function(data) {
		    	console.log('error');
			$scope.sellError=true;
			});
		};

		$scope.buyUnit = function(newUnitTypeN){
			$scope.buy($scope.selectedZone._id, $scope.player._id, newUnitTypeN);
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
			$scope.buyError=true;
			});
		};

		function initMap() {
			if (typeof map === 'undefined') {
				console.log('Init Map');
				var mapOptions = {
					zoom: 12,
					center: new google.maps.LatLng(45.751330, 4.935312)
				};
				map = new google.maps.Map(document.getElementById('game-main-panel'), mapOptions);
			}
		}

		function drawZoneMap(game) {
			initMap();
			if(!isMapInit) {
				var allPolygons = {};
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
					var polygon = new google.maps.Polygon({
						paths: borderCoords,
						strokeColor: '#333333',
						strokeOpacity: 0.65,
						strokeWeight: 2,
						fillColor: '#333333',
						fillOpacity: 0.35,
						clickable:false
					});
					polygon.zoneId = game.zones[i]._id;
					polygon.zoneDescId = game.zones[i].zoneDesc;
					allPolygons[polygon.zoneDescId] = polygon;

					polygon.setMap(map);
					var zd = game.zonesDesc[game.zones[i].zoneDesc];
					var marker = new google.maps.Marker({
					      position: new google.maps.LatLng(zd.y,zd.x),
					      map: map,
					      icon: 'static/zone_'+zd.type+'.png'
					  });
					marker.zoneId = game.zones[i]._id;
					marker.zoneDescId = game.zones[i].zoneDesc;

					google.maps.event.addListener(marker, 'click', function() {
						//console.log(this);
					    onZoneClicked(this);
					});
				}
				// Add zones Polygons to Game variable
				$scope.zonesPolygons = allPolygons;
				// Center the map
				map.setCenter(zoomBordr.getCenter());
				map.fitBounds(zoomBordr); 

				colorMap();
			}
			
		}


		/**
		 *	Update all the colors on the map and the hightlight
		 */
		function colorMap(){
			var selectedZoneDescId;
			var reachableZoneDescId;
			if($scope.selectedZone){
				selectedZoneDescId = $scope.selectedZone.zoneDesc;
				reachableZoneDescId = $scope.game.zonesDesc[selectedZoneDescId].adjacentZones;
			}

			for (var i = 0; i < $scope.game.zones.length; i++) { 
				var zone = $scope.game.zones[i];
				var polygon = $scope.zonesPolygons[zone.zoneDesc];
				var initColor;

				if(zone.owner){
					initColor = $scope.game.players[zone.owner].color;
				} else {
					initColor = 3355443;
				}
				var color = initColor.toString(16);
				var vStrokeOpacity = 0.65;
				var vFillOpacity = 0.3;
				var vStrokeWeight = 1;

				if ($scope.disp.zone&&$scope.disp.zone===zone) {
					initColor = 2212212;
					color = initColor.toString(16);
					vStrokeWeight = 4;
					vFillOpacity = 0.7;
				} else if(selectedZoneDescId && zone.zoneDesc === selectedZoneDescId){
					vStrokeWeight = 4;
					vFillOpacity = 0.7;
				} else if(reachableZoneDescId && reachableZoneDescId.indexOf(zone.zoneDesc) !== -1){
					vFillOpacity = 0.5;
				}

				polygon.setOptions({
					strokeColor: '#'+color,
					fillColor: '#'+color,
					strokeOpacity: vStrokeOpacity,
					strokeWeight: vStrokeWeight,
					fillOpacity: vFillOpacity
				});

			}
		}

		$scope.resetMode=function(){
			$scope.mode = '';
			$scope.disp = {};
			$scope.dispDrag = {};
		};

		$scope.prepareDisp = function(){
			$scope.resetMode();
			$scope.mode = 'displacement';
			$scope.disp = {
				'zoneAId':$scope.selectedZone._id,
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

		function onZoneClicked(polygon){
			var that = polygon;
			$scope.$apply(function(){
				if($scope.mode === 'displacement' && $scope.disp.step>=1){
					$scope.disp.zoneBId = that.zoneId;
					$scope.disp.step=2;
				}
				else{
					$scope.resetMode();
					$scope.selectedZone = $scope.game.zones[that.zoneId];	// TODO Fix this

					$scope.listUnitsByType($scope.game.zones[that.zoneId].units);
					//console.log($scope);
					colorMap();
				}
			});
		}

		$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});	
		$(window).resize(function() {
			$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});
		});

var isDragging=false;
var unitType;

		$document.ready(function() {
			initMap();

			google.maps.event.addDomListener(map, 'click', function (event) {
				for (var i in $scope.zonesPolygons) {
					var polygon=$scope.zonesPolygons[i];
        			if(google.maps.geometry.poly.containsLocation(event.latLng, polygon)) {
        				if(! isDragging) {
            				onZoneClicked(polygon);
            				break;
            			} else {
            				$scope.onDraggedZone(polygon);
            			}
            			break;
        			}
    			}
			});
		});

		// icons for unit
		$scope.iconByUnitType = {
			'0':'fa fa-male fa-4x',
			'1':'fa fa-camera fa-4x',
			'2':'fa fa-book fa-4x',
			'3':'fa fa-trophy fa-4x',
			//'4':'fa-trophy',
			'5':'fa fa-user-md fa-4x',
			'6':'fa fa-plus fa-4x',
			'7':'fa fa-bicycle fa-4x'
		};

		$scope.onDraggedZone = function (polygon) {
			var zoneDragged = $scope.game.zones[polygon.zoneId];
			var errorMess = '';
            if(zoneDragged===$scope.selectedZone) {
				errorMess+='- Vos unités se trouvent déjà sur cette zone !'+'\n';
            }
            if ($scope.game.zonesDesc[$scope.selectedZone.zoneDesc].adjacentZones.indexOf(zoneDragged.zoneDesc) === -1) {
            	errorMess+='- Les déplacements ne se font que sur les zones frontalières à celle sélectionnée !'+'\n';
            }
            if($scope.disp.zone && $scope.disp.zone!==zoneDragged) {
            	errorMess+='- Une zone à la fois !'+'\n';
            }
            if ($scope.unitsByTypeForZone[unitType].length<1) {
				errorMess+='- Vous n\'avez pas d\'unité sur la zone sélectionnée !'+'\n';
            }
            
            if (''===errorMess) {
            	$scope.disp.zone=zoneDragged;
            	$scope.plusUnitToDisplace(unitType);
            	colorMap();
            }
            else {
            	alert(errorMess);
            }
		};

		$scope.plusUnitToDisplace = function (idType) {
			if($scope.disp.unitTypes[idType] < $scope.unitsByTypeForZone[idType].length) {
				$scope.disp.unitTypes[idType]++;
				$scope.mode='displacement';
			}
		};

		$scope.lessUnitToDisplace = function (idType) {
			if($scope.mode==='displacement') {
				if($scope.disp.unitTypes[idType] > 0) {
					$scope.disp.unitTypes[idType]--;
				}
				var isEndDisplacement = true;
				for (var i = 0 ; i < $scope.disp.unitTypes.length ; ++i) {
					if ($scope.disp.unitTypes[i]>0) {
						isEndDisplacement=false;
						break;
					}
				}
				if (isEndDisplacement) {
					$scope.cancelDisplacement();
				}
			}
		};
 
 		$scope.cancelDisplacement = function () {
 			$scope.prepareDispDrag();
 			$scope.mode='';
 			$scope.disp.zone=undefined;
 			colorMap();
 		};

 		$scope.validateDisplacement = function () {
 			var listUnits=[];
 			for (var i=0 ; i < $scope.disp.unitTypes.length ; i++) {
 				for (var j = 0 ; j < $scope.disp.unitTypes[i] ; j++) {
 					listUnits.push($scope.unitsByTypeForZone[i][j]._id);
 				}
 			}
 			$scope.move($scope.selectedZone._id,$scope.disp.zone._id,listUnits);
 			$scope.cancelDisplacement();
 		};
 
		$scope.onUnitIconDrag = function (event, ui) {	
			if (''===$scope.mode) {
				$scope.prepareDispDrag();
			}
			unitType=ui.helper.attr('data-unit-type');
			ui.helper.css('opacity', '0.8'); // impossible with addClass ...
			isDragging=true;
		};

  		$scope.onUnitIconDrop = function (event, ui) {
			simulateClick(event.pageX, event.pageY);
			isDragging=false;
  		};

  		$scope.prepareDispDrag = function () {
			$scope.resetMode();
			$scope.disp = {
				'zone':undefined,
				'unitTypes':[],
				//'step':0
			};
			for (var type in $scope.game.matrixes.UnitData.content) {
				$scope.disp.unitTypes[type]=0;
			}
  		};

  		function simulateClick(x, y) {
    		var clickEvent= document.createEvent('MouseEvents');
    		clickEvent.initMouseEvent(
    			'click', true, true, window, 0,
    			0, 0, x, y, false, false,
    			false, false, 0, null
    		);
    		document.elementFromPoint(x, y).dispatchEvent(clickEvent);
		}
		
		$scope.resetMode();
		window.scrollTo(0,0);
		$('body').css('overflow-y','hidden');

		$scope.$on('$destroy', function(){
        	$('body').css('overflow-y','auto');
    	});
	}
]);
