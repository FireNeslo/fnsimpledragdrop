directive('fnDragOver', function () {
	'use strict';
	return {
		restrict: 'A',
		require: '^fnDrop',
		link: function(scope, el, attrs, fnDrop) {
			var on = el[0].addEventListener.bind(el[0]);
			on("dragover", function() {
				fnDrop.over(scope.$eval(scope[attrs['fnDragOver']]));
			});
			on("dragleave", function() {
				fnDrop.leave(scope.$eval(scope[attrs['fnDragOver']]));
			});
		}
	};
})