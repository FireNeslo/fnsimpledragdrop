directive('fnDrag', function ($rootScope) {
	'use strict';
	return {
		restrict: 'A',
		scope: {
			onDrag: '&',
			fnDrag : '='
		},
		link: function(scope, el, attrs) {
			el.attr('draggable', true);
			var on = el[0].addEventListener.bind(el[0])
				, dragging = {
				element: el,
				data: scope.fnDrag
			};
			scope.$watch('fnDrag', function(data) {
				dragging.data = data;
			});
			function dragStart(e) {
				e.dataTransfer.effectAllowed = "move";
				e.dataTransfer.setDragImage(el[0], 0, 0);
				scope.onDrag({dragEl: el, data: scope.draggable});
				$rootScope.$emit("fn-dragstart", dragging);
			}
			function dragEnd() {
				$rootScope.$emit("fn-dragend", dragging);
			}
			on("dragstart", dragStart, false);
			on("dragend", dragEnd,false);
		}
	}
})