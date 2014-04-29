directive('fnDrag', function ($rootScope) {
	'use strict';
	return function(scope, el, attrs) {
		el.attr('draggable', true);
		var on = el[0].addEventListener.bind(el[0])
			, dragging = {element: el};
		function dragStart(e) {
			dragging.data = scope.$eval(attrs.fnDrag);
			dragging.source = scope.$eval(attrs.fnSource);
			e.dataTransfer.effectAllowed = "move";
			e.dataTransfer.setDragImage(el[0], 0, 0);
			$rootScope.$emit("fn-dragstart", dragging);
		}
		function dragEnd() {
			$rootScope.$emit("fn-dragend", dragging);
		}
		on("dragstart", dragStart, false);
		on("dragend", dragEnd,false);
	};
})