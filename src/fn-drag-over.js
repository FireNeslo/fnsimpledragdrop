directive('fnDragOver', function (fnDragDrop) {
  'use strict'
  return {
    restrict: 'A',
    link: function (scope, el, attrs) {
      fnDragDrop(el[0])
        .on("dragover", function onDragOver(e) {
          fnDragDrop.dragging[e.detail].over = scope.$eval(attrs.fnDragOver)
        })
    }
  }
})
