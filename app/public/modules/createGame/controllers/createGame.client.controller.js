'use strict';


angular.module('createGame').controller('CreateGameController', ['$scope',
																'Authentication',
																'$http',
	function($scope, Authentication, $http) {
		console.log($scope);
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.newGame = {
			'startTime' : Math.floor(new Date().getTime()) + 3600000,
			'title':'',
			'maxPlayers' : '',
			'minPlayers' : ''
		};

		$scope.error = {
			'maxPlayers' : $scope.newGame.maxPlayers>6 || $scope.newGame.maxPlayers<2
		};

		$scope.createGame = function(){
			console.log('Asking for game creation');
			if($scope.newGame.maxPlayers>6 || $scope.newGame.maxPlayers<2){
					$scope.newGame.maxPlayers=5;
					console.log('Wrong max number of players');
					return;				
				}
			$http.post('/services/game/create', $scope.newGame).
			  //success(function(data, status, headers, config) {
			  success(function(data) {
				console.log('returned success '+data.success);				
			  }).
			  error(function(data) {
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
