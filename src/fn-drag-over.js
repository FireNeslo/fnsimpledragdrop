directive('fnDragOver', function () {
	'use strict';
	return {
		restrict: 'A',
		require: '^fnDrop',
		link: function(scope, el, attrs, fnDrop) {
			var on = el[0].addEventListener.bind(el[0]);
			on("dragover", function() {
				fnDrop.over(scope[attrs['fnDragOver']]);
				scope.$apply();
			});
			on("dragleave", function() {
				fnDrop.leave(scope[attrs['fnDragOver']]);
				scope.$apply();
			});
		}
	};
})