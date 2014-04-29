directive('fnDrop', function($rootScope) {
	'use strict';
	var dragging;
	$rootScope.$on("fn-dragstart", function(event, data) {
		dragging = data;
		angular.element(data.element).addClass("fn-dragging");
	});

	$rootScope.$on("fn-dragend", function(event, data) {
		dragging = null;
		angular.element(data.element).removeClass("fn-dragging");
	});
	return {
		restrict: 'A',
		scope: {
			fnDrop: '&'
		},
		link: function(scope, el, attrs, controller) {
			var on = el[0].addEventListener.bind(el[0]);
			on("dragover", function(e) {
				e.preventDefault();
				e.dataTransfer.dropEffect = 'move';
			}, false);

			on("dragenter", function(e) {
				el.addClass('fn-over');
			}, false);

			on("dragleave", function(e) {
				el.removeClass('fn-over');
			}, false);

			on("drop", function(e) {
				e.preventDefault();
				scope.fnDrop({over: scope.over, data: dragging.data});
				el.removeClass('fn-over');
				scope.$apply();
			}, false);
		},
		controller : function($scope) {
			this.over = function(data) {
				$scope.over = data;
			};
			this.leave = function(data) {
				$scope.over = undefined;
			};
		}
	}
})