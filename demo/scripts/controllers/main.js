'use strict';

angular.module('fnSimpleDragDropApp')
  .controller('MainCtrl', function ($scope) {
		$scope.source = ['hello','guys','fun','with','drag','and','drop','is','it','not?'];
		$scope.target = [];
		$scope.drop = function(from, to, data, $index) {
			$index === undefined && ($index = to.length);
			var index = from.indexOf(data), temp;
			if(index < 0) {
				from = to;
				index = from.indexOf(data);
			}
			if(index > -1) {
				from.splice(index,1);
				to.splice($index,0, data);
			}
		};
  });
