'use strict';

angular.module('fnSimpleDragDropApp')
  .controller('MainCtrl', function ($scope) {
		$scope.source = ['hello','guys','fun','with','drag','and','drop','is','it','not?'];
		$scope.target = [];
		$scope.drop = function(from, to, data, $index) {
			from.splice(from.indexOf(data),1);
			to.splice($index!=undefined?$index:to.length,0, data);
		};
  });
