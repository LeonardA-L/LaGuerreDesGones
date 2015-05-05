'use strict';

angular.module('createGame').controller('CreateGameController', ['$scope','Authentication','$http','$filter', 
	function($scope, Authentication, $http, $filter) {
		console.log($scope);
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.errDate=false;		

		var _date=new Date();
		_date.setMinutes((_date.getMinutes()+15)-(_date.getMinutes()+15)%10);

		$scope.startHour=$filter('date')(_date,'HH');
		$scope.startTime=$filter('date')(_date,'mm');
		$scope.startDay=new Date();

		$scope.newGame = {
			'startTime' : '',
			'title':'New Game',
			'nMinPlayer' : 2,
			'nMaxPlayer' : 8			
		};

		$scope.today = function() {
			$scope.startDay = new Date();
		};


		$scope.clear = function () {
			$scope.startDay = null;
		};

		$scope.toggleMin = function() {
			$scope.minDate = new Date();
		};

		$scope.toggleMin();

		$scope.open = function($event) {
			$event.preventDefault();
			$event.stopPropagation();

			$scope.opened = true;
		};

		$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
		};
	
		// Choose date format
		$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
		$scope.format = $scope.formats[0];
		
		$scope.hours = [];
		for(var i=0; i<24; i++){
			 if(i<10){
				$scope.hours[i]={'num':'0'+i};
			}else{
				$scope.hours[i]={'num':i};
			}
		}
		$scope.minutes = []
		for(var i=0; i<60; i++){
			 if(i<10){
				$scope.minutes[i]={'num':'0'+i};
			}else{
				$scope.minutes[i]={'num':i};
			}
		}


		
		$scope.lastTitleGame = "";
		$scope.b_lastGameHasSameName = false;

		$scope.createGame = function(){
			$scope.partyHost = false;
			$scope.b_lastGameHasSameName = false;
			$scope.errDate=false;
			$scope.startDay.setHours($scope.startHour);
			$scope.startDay.setMinutes($scope.startTime);
			$scope.startDay.setSeconds(0);
			$scope.newGame.startTime=$scope.startDay;

			if($scope.newGame.startTime.getTime()<new Date().getTime()){
				$scope.errDate=true;
				return;
			}
			console.log('Asking for game creation');
			$http.post('/services/game/create', $scope.newGame).
			//success(function(data, status, headers, config) {
			success(function(data) {
				$scope.partyHost = true;
				if ($scope.lastTitleGame == $scope.newGame.title){
					$scope.b_lastGameHasSameName = true;			
				}
				$scope.lastTitleGame = $scope.newGame.title;
				
				// console.log('returned success '+data.success);
				console.log('------ New Game ---------');
				console.log('PartyHost ?? ' + $scope.partyHost);	
				console.log('Start Time : '+ $scope.newGame.startTime);	
				console.log('Title : '+ $scope.newGame.title);	
				console.log('Min Players : '+ $scope.newGame.nMinPlayer);
				console.log('Max Players : '+ $scope.newGame.nMaxPlayer);					
			 }).error(function(data) {
			  	console.log('error with hosting the game');
				$scope.partyNotHost = true;
			 });
		};

		
	}

]);
