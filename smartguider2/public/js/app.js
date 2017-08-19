'use strict';

var app = angular.module('app', ['ngRoute', 'ngResource', 'ngFileUpload'])
  .constant('config', {
    states: ['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']
});

app.config(['$routeProvider', function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'home.html'
    })
    .when('/spots', {
      templateUrl: 'spots.html',
      controller: 'SpotsCtrl'
    })
    .when('/spots/:spotId', {
      templateUrl: 'spot.html',
      controller: 'SpotCtrl'
    })
    .when('/sights', {
      templateUrl: 'sights.html',
      controller: 'SightsCtrl'
    })
    .when('/sights/:sightId', {
      templateUrl: 'sight.html',
      controller: 'SightCtrl'
    })
    .when('/spot/insert', {
      templateUrl: 'spotAdd.html',
      controller: 'SpotAddCtrl'
    })
		.when('/sight/insert', {
			templateUrl: 'sightAdd.html',
			controller: 'SightAddCtrl'
		})
    .otherwise({
      redirectTo: '/'
    });
}]);

app.factory('SpotService', ['$resource', function($resource) {
  return $resource('/spots/:spotId', {}, {
    update: {
      method: 'PUT'
    }
  });
}]);

app.factory('SpotAddService', ['$resource', function($resource) {
  return $resource('/spot/insert', {}, {
    save: {
      method: 'POST'
    }
  });
}]);

app.factory('SpotDeleteService', ['$resource', function ($resource) {
	return $resource('/spot/delete/:spotId', {}, {
		delete: {
			method: 'DELETE'																							
		}
	});
}]);

app.factory('SightAddService', ['$resource', function ($resource) {
  return $resource('/sight/insert', {}, {
    save: {
      method: 'POST'
    }
  });
}]);

app.factory('SightDeleteService', ['$resource', function ($resource) {
	return $resource('/sight/delete/:sightId', {}, {
		delete: {
			method: 'DELETE'
		}
	});
}]);

app.factory('SightService', ['$resource', function ($resource) {
  return $resource('/sights/:sightId', {}, {
		/*
		get: {
			method: 'GET'
		},
		update: {
			method: 'PUT'
		}
		*/
	});
}]);

app.factory('SightUpdateService', ['$resource', function ($resource) { return $resource('/sights/:sightId', {}, {
		update: {
			method: 'PUT'
		}
	});
}]);

/*
app.factory('SightService', ['$resource', function($resource) {
  return $resource('/sights/:sightId');
}]);
*/

app.directive('imageFallback', function() {
  return {
    link: function(scope, elem, attrs) {
      elem.bind('error', function() {
        angular.element(this).attr('src', attrs.imageFallback);
      });
    }
  };
}).directive('editInLine', function ($compile) {
  var exports = {};
  function link (scope, element, attrs) {
    var template = '<div class="in-line-container">';
    var newElement;
    var displayValue;
    var options;

    switch (attrs.editType) {
			case 'select':
				displayValue = attrs.displayValue ? 'displayValue' : 'value';
				options = attrs.editOption;
				options = options.replace(attrs.editList, 'editList');

				template += '<div class="in-line-value" ng-hide="editing">{{' + displayValue + '}}</div>';
				template += '<select class="in-line-input form-control" ng-show="editing" ng-model="value" ng-options="'+ options +'"></select>';
				break;
			case 'number':
				template += '<div class="in-line-value" ng-hide="editing">{{value}}</div>';
				template += '<input class="in-line-input form-control" ng-show="editing" type="number" ng-model="value" step="any" min="0" max="99999" />'
				break;
			case 'textarea':
				template += '<div class="in-line-value" ng-hide="editing">{{value}}</div>';
				template += '<textarea class="in-line-input form-control" ng-show="editing" type="text" ng-model="value"';
				break;
			default:
				template += '<div class="in-line-value" ng-hide="editing">{{value}}</div>';
				template += '<input class="in-line-input form-control" ng-show="editing" type="text" ng-model="value" />';
    }

    // 바깥쪽 div를 닫는다.
    template += '</div>';
    newElement = $compile(template)(scope);
    element.replaceWith(newElement);

    scope.$on('$destroy', function () {
      newElement = undefined;
      element = undefined;
    });
  }

  exports.scope = {
    value: '=',
    editing: '=',
    editList: '=',
    displayValue: '='
  };
  exports.restrict = 'E';
  exports.link = link;

  return exports;
}).directive('gMap', ['$timeout', function ($timeout) {
	return {
		restrict: 'EA',
		link: function (scope, iElement, iAttrs) {
			// 지도를 담고 있는 div 요소 생성과 스타일 지정
			var el = document.createElement("div");
			el.style.width = "100%";
			el.style.height = "100%";
			iElement.prepend(el);
			
			// 구글 맵 생성 - 클릭 시 center 변경 안되면 $watch 안으로
			var map = new google.maps.Map(el, {});
		
			// 수정, 보기 모드 전환시 작동
			scope.$watch('editing', function () {
				// 수정 모드일 시에.. 
				if (scope.editing) {
					// 위치좌표를 가져옴
					var cordi = (iAttrs.center !== undefined) ? JSON.parse(iAttrs.center) : [37.561192, 127.030487];
					
					// zoom 값 가져옴, 없으면 17로 설정
					var zoom = (iAttrs.zoom !== '') ? Number(iAttrs.zoom) : 17;

					// 초기에 가져온 위치좌표에 맞춰 맵 옵션 설정
					var mapOptions = {
						center: new google.maps.LatLng(cordi[0], cordi[1]),
						zoom: zoom,
						mapTypeId: google.maps.MapTypeId.ROADMAP
					};

					// 맵 잘림 방지 코드
					$timeout(function () {
							google.maps.event.trigger(map, "resize");
						});

					map.setOptions(mapOptions);
					
					// 맵 클릭시 좌표값을 위치좌표로 전달
					google.maps.event.addListener(map, 'click', function (event) {
						scope.spot.coordinate.latitude = event.latLng.lat();
						scope.spot.coordinate.longitude = event.latLng.lng();
						scope.spot.coordinate.zoom = map.getZoom();

						scope.$apply();
					});
					
					// 맵에서 클릭한 위치에 맞춰 중심 이동
					iAttrs.$observe("center", function (value) {
						var latlng = JSON.parse(value);
						map.setCenter({lat:latlng[0], lng:latlng[1]});
					});
				}
				/*
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({'address': address}, function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						map.setCenter(results[0].geometry.location);
					}
				}
				*/
			});
			
		}
	};
}]).directive('fileModel', ['$parse', function ($parse) {
	return {
		restrict: 'A',
		llink: function (scope, element, attrs) {
			var model = $parse(attrs.fileModel);
			var modelSetter = model.assign;
			
			element.bind('change', function () {
				scope.$apply(function () {
					modelSetter(scope, element[0].files[0]);
				});
			});
		}
	};
}]);

app.service('fileUpload', ['$http', function ($http) {
	this.uploadFileToUrl = function (file, uploadUrl) {
		var fd = new FormData();
		fd.append('file', file);
		$http.post(uploadUrl, fd, {
			transformRequest:
				angular.identity, headers: {
					'Content-Type': undefined
				}
		}).success(function () {
			
		}).error(function () {
			
		});
	}
}]);

app.controller('SpotsCtrl', ['$scope', 'SpotService', 'SpotDeleteService', '$route', function($scope, SpotService, SpotDeleteService, $route) {
  SpotService.query(function (data, headers) {
    $scope.spots = data;
  }, _handleError);
	
	$scope.editing = false;
	
	$scope.edit = function() {
    $scope.editing = !$scope.editing;
  };
	
	$scope.cancel = function () {
    $route.reload();
  }
	
	$scope.delete = function (id) {

		SpotDeleteService.delete({
			spotId: id
		}, function (err) {
			
		});
		
		SpotService.query(function (data, headers) {
    	$scope.spots = data;
  	}, _handleError);
		
		$route.reload();
	};
}]);

app.controller('SpotCtrl', ['$scope', '$routeParams', 'SpotService', 'SightService', '$q', 'config', '$route', function($scope, $routeParams, spot, sight, $q, config, $route) {
  $scope.inside = {};
	$scope.address = {};

  function getSight (sights, sightId) {
    for (var i = 0, l = sights.length; i < l; ++i) {
      var t = sights[i];
      if (t._id === sightId) {
        return t;
      }
    }
  }

  $q.all([
    spot.get({
      spotId: $routeParams.spotId
    }).$promise,
    sight.query().$promise
  ]).then(function(values) {
    $scope.sights = values[1];
    $scope.spot = values[0];
		
		if (!$scope.spot.inside.floors.length) {
			$scope.spot.inside.floors = [""];
		}
		
    $scope.spot.sight = getSight($scope.sights, $scope.spot.sight._id);
  }).catch(_handleError);

  $scope.editing = false;
  // 동일 배열에 대한 중복 참조를 피하기 위해, 새로운 복사본을 제공한다.

  $scope.edit = function() {
    $scope.editing = !$scope.editing;
  };

  $scope.save = function() {
    // 데이터베이스에서 빈 행을 방지하고, UI를 깨끗하게 유지한다.
    // 빈행을 삭제한다.
    var lines = $scope.spot.inside.floors;

    if (lines.length) {
      lines = lines.filter(function (value) {
        return value;
      });
    }

    $scope.spot.inside.floors = lines;
		
		var f = document.getElementById('file').files[0],
				r = new FileReader();
		r.onloadend = function (e) {
			var data = e.target.result;
		}
		r.readAsBinaryString(f);

    spot.update({
      spotId: $routeParams.spotId
    }, $scope.spot, function () {
      $scope.editing = !$scope.editing;
    });
  };

  $scope.cancel = function () {
    $route.reload();
  }

  $scope.address.addLine = function (index) {
    var lines = $scope.spot.inside.floors;

    lines.splice(index + 1, 0, '');
  }

  $scope.address.removeLine = function (index) {
    var lines = $scope.spot.inside.floors;

    lines.splice(index, 1);
  }
	
	/*
	$scope.onFileSelect = function ($files) {
		for (var i = 0; i < $files.length; i++) {
			var file = $files[i];
			
			$scope.upload = $upload.upload({
				url: '/upload',
				method: 'POST',
				file: file,
				fileFormDataName: 'fileField1'
			}).success(function (data, status, headers, config) {
				console.log(data);
			});
		}
	}
	*/
}]);

app.controller('SightsCtrl', ['$scope', 'SightService', 'SightDeleteService', '$route', function($scope, SightService, SightDeleteService, $route, sight) {
  SightService.query(function (data) {
    $scope.sights = data;
  }, _handleError);
	
	$scope.editing = false;
	
	$scope.edit = function () {
		$scope.editing = !$scope.editing;
	};
	
	$scope.cancel = function () {
		$route.reload();
	};
	
	$scope.delete = function (id) {
		SightDeleteService.delete({
			sightId: id
		}, function (err) {
			
		});
		
		$route.reload();
	};
	
}]);

app.controller('SightCtrl', ['$scope', '$routeParams',  'SightService', 'SightUpdateService', 'SpotDeleteService', '$q', '$route', function($scope, $routeParams, SightService, SightUpdateService, SpotDeleteService, sight, $q, $route) {
	
  SightService.get({
    sightId: $routeParams.sightId
  }, function(data, headers) {
    $scope.sight = data;
  }, _handleError);
	
	$scope.editing = false;
	
	$scope.edit = function () {
		$scope.editing = !$scope.editing;
	};
	
	$scope.save = function() {
		/*
		var lines = $scope.sight.address.lines;
		
		if (lines.length) {
			lines = lines.filter(function (value) {
				return value;
			});
		}
		
		$scope.sight.address.lines = lines;
		*/
		
		SightUpdateService.update({
			sightId: $routeParams.sightId
		}, $scope.sight, function () {
			$scope.editing = !$scope.editing;
		});
	}
	
	$scope.cancel = function () {
		//$route.reload();
		SightService.get({
			sightId: $routeParams.sightId
		}, function(data, headers) {
			$scope.sight = data;
		}, _handleError);
		
		$scope.editing = !$scope.editing;
	};
	
	$scope.delete = function (id) {

		SpotDeleteService.delete({
			spotId: id
		}, function (err) {
			
		});
		
		SightService.get({
    	sightId: $routeParams.sightId
  	}, function(data, headers) {
    	$scope.sight = data;
  	}, _handleError);
	};
	
	var element_wrap = document.getElementById('wrap');
	
	$scope.foldDaumPostcode = function () {
		// iframe을 넣은 element를 안보이게 한다
		element_wrap.style.display = 'none';
	}
	
	$scope.search = function () {
		var currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
		
		new daum.Postcode({
			oncomplete: function (data) {
				// 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

				// 각 주소의 노출 규칙에 따라 주소를 조합한다.
				// 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
				var fullAddr = data.address;
				var extraAddr = '';
				
				// 기본 주소가 도로명 타입일때 조합한다.
				if (data.addressType === 'R'){
						//법정동명이 있을 경우 추가한다.
						if (data.bname !== '') {
								extraAddr += data.bname;
						}
					
						// 건물명이 있을 경우 추가한다.
						if (data.buildingName !== '') {
								extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
						}
					
						// 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
						fullAddr += (extraAddr !== '' ? ' ('+ extraAddr +')' : '');
				}
				
				// 우편정보와 주소 정보를 해당 필드에 넣는다.
				$scope.sight.zip = data.zonecode;
				$scope.sight.address = fullAddr;
				
				// iframe을 넣은 element를 안보이게 한다.
				// (autoClose:false 기능을 이용한다면, 아래 코드를 제거해야 화면에서 사라지지 않는다.)
				element_wrap.style.display = 'none';
				
				// 우편번호 찾기 화면이 보이기 이전으로 scroll 위치를 되돌린다
				document.body.scrollTop = currentScroll;
				
				$scope.$apply();
			},
			// 우편번호 찾기 화면 크기가 조정되었을 때 실행할 코드를 작성하는 부분, iframe을 넣은 element의 높이값을 조정한다.
			onresize : function (size) {
				element_wrap.style.height = size.height + 'px';
			},
			width: '100%',
			height: '100%'
		}).embed(element_wrap);
		
		// iframe을 넣은 element를 보이게 한다.
		element_wrap.style.display = 'block';
	}
}]);

app.controller('SightAddCtrl', ['$scope', '$routeParams', 'SightAddService', '$q', 'config', '$route', function ($scope, $routeParams, sight, $q, config, $route) {

	$scope.editing = true;
	//$scope.states = config.states.slice(0);
	
	$scope.edit = function () {
	}
	
	$scope.save = function () {
		sight.save($scope.sight, function () {
			$scope.editing = !$scope.editing;
		});
	}
	
	$scope.cancel = function () {
		$route.reload();
	}
	
	var element_wrap = document.getElementById('wrap');
	
	$scope.foldDaumPostcode = function () {
		// iframe을 넣은 element를 안보이게 한다
		element_wrap.style.display = 'none';
	}
	
	$scope.search = function () {
		var currentScroll = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
		
		new daum.Postcode({
			oncomplete: function (data) {
				// 검색결과 항목을 클릭했을때 실행할 코드를 작성하는 부분.

				// 각 주소의 노출 규칙에 따라 주소를 조합한다.
				// 내려오는 변수가 값이 없는 경우엔 공백('')값을 가지므로, 이를 참고하여 분기 한다.
				var fullAddr = data.address;
				var extraAddr = '';
				
				// 기본 주소가 도로명 타입일때 조합한다.
				if (data.addressType === 'R'){
						// 법정동명이 있을 경우 추가한다.
						if (data.bname !== '') {
								extraAddr += data.bname;
						}
					
						// 건물명이 있을 경우 추가한다.
						if (data.buildingName !== '') {
								extraAddr += (extraAddr !== '' ? ', ' + data.buildingName : data.buildingName);
						}
					
						// 조합형주소의 유무에 따라 양쪽에 괄호를 추가하여 최종 주소를 만든다.
						fullAddr += (extraAddr !== '' ? ' ('+ extraAddr +')' : '');
				}
				
				// 우편정보와 주소 정보를 해당 필드에 넣는다.
				$scope.sight.zip = data.zonecode;
				$scope.sight.address = fullAddr;
				
				// iframe을 넣은 element를 안보이게 한다.
				// (autoClose:false 기능을 이용한다면, 아래 코드를 제거해야 화면에서 사라지지 않는다.)
				element_wrap.style.display = 'none';
				
				// 우편번호 찾기 화면이 보이기 이전으로 scroll 위치를 되돌린다
				document.body.scrollTop = currentScroll;
				
				$scope.$apply();
			},
			// 우편번호 찾기 화면 크기가 조정되었을 때 실행할 코드를 작성하는 부분, iframe을 넣은 element의 높이값을 조정한다.
			onresize : function (size) {
				element_wrap.style.height = size.height + 'px';
			},
			width: '100%',
			height: '100%'
		}).embed(element_wrap);
		
		// iframe을 넣은 element를 보이게 한다.
		element_wrap.style.display = 'block';
	}
	
	/*
	$scope.$watch($scope.sight.address, function() {
  	$scope.$apply();
	});
	*/
	
}]);

app.controller('SpotAddCtrl', ['$scope', '$routeParams', 'SpotAddService', 'SightService', '$q', '$route', 'Upload', function ($scope, $routeParams, spot, sight, $q, $route, Upload) {
	$scope.inside = {};
	$scope.address = {};
	
	$scope.editing = true;
	
	function getSight (sights, sightId) {
		for (var i = 0, l = sights.length; i < l; ++i) {
			var t = sights[i];
			if (t._id === sightId) {
				return t;
			}
		}
	}
	
	$q.all([
		sight.query().$promise
	]).then(function (values) {
		$scope.sights = values[0];
		$scope.spot.sight = getSight($scope.sights, $scope.spot.sight._id);
		
		$scope.spot.inside.floors = "";
	}).catch(_handleError);
	
	// 선택 파일
	$scope.onFileSelect = function ($files) {
		$scope.spot.image = $files[0];
	};
	
	
	$scope.save = function () {
		
		/*
		var f = document.getElementById('file').files[0],
				r = new FileReader();
		r.onloadend = function (e) {
			var data = e.target.result;
		}
		r.readAsBinaryString(f);
		*/
		
		/*
		var file = $scope.myFile;
		console.log('file is ');
		console.dir(file);
		var uploadUrl = "/fileUpload";
		fileUpload.uploadFileToUrl(file, uploadUrl);
		*/
		
		/*
		$scope.upload = $upload.upload({
			url: '/upload',
			method: 'POST',
			file: $scope.spot.image
		}).success(function (data, status, headers, config) {
			console.log(data);
		});
		*/
		

		if ($scope.form.file.$valid && $scope.file) {
			//$scope.upload($scope.file);
		}

		var lines = $scope.spot.inside.floors;
		
		if (lines.length) {
			lines = lines.filter(function (value) {
				return value;
			});
		}
		
		$scope.spot.inside.floors = lines;
		
		spot.save($scope.spot, function() {
      $scope.editing = !$scope.editing;
    });
	}
	/*
	$scope.upload = function (file) {
		Upload.upload({
			url: '/upload',
			data: {file: fiel}
		}).then(function (resp) {
			if (resp.data.error_code === 0) {
				console.log('Success');
			} else {
				console.log('an error occured');
			}
		}, function (resp) {
			console.log('Error status: ' + resp.status);
		}, function (evt) {
			console.log(evt);
		}
		
	}
	*/
		
	$scope.cancel = function () {
		$route.reload();
	}
		
	$scope.address.addLine = function (index) {
		var lines = $scope.spot.inside.floors;
			
		lines.splice(index + 1, 0, '');
	}
		
	$scope.address.removeLine = function (index) {
		var lines = $scope.spot.inside.floors;
			
		lines.splice(index, 1);
	}
}]);

function _handleError(response) {
  // TODO: 여기서 뭔가를 수행한다. 대부분 오류 페이지로 리디렉트한다.
  console.log('%c ' + response, 'color:red');
}