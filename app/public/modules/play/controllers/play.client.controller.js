'use strict';
/* global google */
/* global $ */

angular.module('play').controller('PlayController', ['$scope', 'Authentication', '$http', '$stateParams', '$document', 'Socket', '$timeout',
	function($scope, Authentication, $http, $stateParams, $document, Socket, $timeout) {
		// This provides Authentication context.
		$scope.authentication = Authentication;

		$scope.game = {
			'title':'Loading...'
		};
		$scope.listUnitType = false;
	    var gameId = $stateParams.gameId;

		var map;
		var isMapInit = false;

		console.log($stateParams);

		var generationInterval = 120000;


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
						strokeWeight: 1,
						fillColor: '#333333',
						fillOpacity: 0.35
					});
					polygon.zoneId = game.zones[i]._id;
					polygon.zoneDescId = game.zones[i].zoneDesc;
					allPolygons[polygon.zoneDescId] = polygon;
					// Listener on click
					google.maps.event.addListener(polygon, 'click', onZoneClicked);
					polygon.setMap(map);
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

				if(reachableZoneDescId){
					console.log(reachableZoneDescId.indexOf(zone.zoneDesc));
				}

				if(selectedZoneDescId && zone.zoneDesc === selectedZoneDescId){
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
		};

		$scope.prepareDisp = function(){
			$scope.resetMode();
			$scope.mode='displacement';
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

		function onZoneClicked(event){
			var that = this;
			$scope.$apply(function(){
				if($scope.mode === 'displacement' && $scope.disp.step>=1){
					$scope.disp.zoneBId = that.zoneId;
					$scope.disp.step=2;
				}
				else{
					$scope.resetMode();
					$scope.selectedZone = $scope.game.zones[that.zoneId];	// TODO Fix this
					//console.log($scope.game);
					$scope.listUnitsByType($scope.game.zones[that.zoneId].units);
					colorMap();
				}
			});
		}

		$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});
		$(window).resize(function() {
			$('#game-wrap-panels').css({'height':(($(window).height())-$('header').height())+'px'});
		});

		$document.ready(function() {
			initMap();
		});

  		$scope.onUnitIconDrop = function (event, ui) {
  			// TODO get zone for pageX/Y
			$(document.elementFromPoint(event.pageX, event.pageY)).click();  
  		};
		
		$scope.resetMode();
	}
]);
