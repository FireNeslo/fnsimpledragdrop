directive('fnDrop', function($rootScope) {
	'use strict';
	var dragging, over =  null;
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
		link: function(scope, el, attrs, controller) {
			var on = el[0].addEventListener.bind(el[0]);

			on("dragover", function(e) {e.preventDefault();e.dataTransfer.dropEffect = 'move';}, false);
			on("dragenter", function(e) {el.addClass('fn-over');}, false);
			on("dragleave", function(e) {el.removeClass('fn-over');}, false);

			on("drop", function(e) {
				e.preventDefault();
				scope.$apply(function() {
					scope.$eval(attrs.fnDrop, {
						$over: over,
						$data:dragging.data,
						$source: dragging.source,
						$target: scope.$eval(attrs.fnTarget)
					});
					el.removeClass('fn-over');
				});
			}, false);
		},
		controller : function($scope) {
			this.over = function(data) {
				over = data;
			};
			this.leave = function(data) {
				over = null;
			};
		}
	}
})