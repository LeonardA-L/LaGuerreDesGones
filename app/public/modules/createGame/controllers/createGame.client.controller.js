'use strict';


angular.module('createGame').controller('CreateGameController', ['$scope','Authentication','$http','$filter',
	function($scope, Authentication, $http, $filter) {
		console.log($scope);
		// This provides Authentication context.
		$scope.authentication = Authentication;

		
		var _date=new Date();
		_date.setHours(_date.getHours()+1);
		if(_date.getMinutes()<15 || _date.getMinutes()>45){
			_date.setMinutes(0);		
		}else{
			_date.setMinutes(30);
		}

		//TODO : ajouter un attribut jour à newGame
		$scope.newGame = {
			'startTime' : $filter('date')(_date,'HH:mm'),
			'title':'',
			'minPlayers' : 2,
			'maxPlayers' : 6
			
		};

		$scope.hours = [{'num':'1'},{'num':'2'}];
		for(var i=0; i<24; i++){
			 if(i<10){
				$scope.hours[2*i]={'num':'0'+i+':00'};
				$scope.hours[2*i+1]={'num':'0'+i+':30'};	
			}else{
				$scope.hours[2*i]={'num':i+':00'};
				$scope.hours[2*i+1]={'num':i+':30'};
			}
				
		}
		
		$scope.createGame = function(){
			console.log('Asking for game creation');
			
			$http.post('/services/game/create', $scope.newGame).
			//success(function(data, status, headers, config) {
			success(function(data) {
				// console.log('returned success '+data.success);
				console.log('------ New Game ---------');	
				console.log('Start Time : '+ $scope.newGame.startTime);	
				console.log('Title : '+ $scope.newGame.title);	
				console.log('Min Players : '+ $scope.newGame.minPlayers);
				console.log('Max Players : '+ $scope.newGame.maxPlayers);					
			 }).error(function(data) {
			  	console.log('error');
			 });
		};

		
	}

]);

angular.module('createGame').controller('DatepickerDemoCtrl', function ($scope) {
	$scope.today = function() {
		$scope.dt = new Date();
	};
	$scope.today();

	$scope.clear = function () {
		$scope.dt = null;
	};

	$scope.toggleMin = function() {
		$scope.minDate = $scope.minDate ? null : new Date();
	};
	$scope.toggleMin();

	// No max, we can create a game in 2058 !
	/* $scope.toggleMax = function() {
		var date = new Date();
		date.setMonth(date.getMonth() + 1);
		$scope.maxDate = $scope.maxDate ? null : date ;
	};
	$scope.toggleMax(); */

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

});
