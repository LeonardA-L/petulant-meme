'use strict';


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

		$( document ).ready(function() {
			initMap();
		});

		$http.get('/services/play/'+gameId+'/start').
		  //success(function(data, status, headers, config) {
		  success(function(data) {
			
			$scope.game = data.success;

			// Connection between player and hash
			for(var i=0;i<$scope.game.players.length;i++){
				$scope.game.players[$scope.game.players[i]._id] = $scope.game.players[i];
			}
			// Connection between zone and hash
			for(var j=0;j<$scope.game.zones.length;j++){
				$scope.game.zones[$scope.game.zones[j]._id] = $scope.game.zones[j];
			}
			console.log($scope.game);
		  }).
		  error(function(data) {
		    console.log('error');
		});

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
		  console.log('Init Map');
		  var mapOptions = {
			zoom: 8,
			center: new google.maps.LatLng(45.753516, 4.909520)
		  };
		  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		}

		function drawZoneMap() {
		  
		}
	}
]);
