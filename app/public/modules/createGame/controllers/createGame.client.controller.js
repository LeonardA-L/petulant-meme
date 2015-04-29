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

		$scope.newGame = {
			'startTime' : $filter('date')(_date,'HH:mm'),
			'title':'',
			'maxPlayers' : 6,
			'minPlayers' : 2
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
				console.log('returned success '+data.success);				
			  }).
			  error(function(data) {
			    console.log('error');
			  });
		};

		
	}
]);
