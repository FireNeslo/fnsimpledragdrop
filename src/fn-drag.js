directive('fnDrag', function ($rootScope, fnDragDrop) {
  'use strict'
  return function (scope, el, attrs) {
    var dragging = {element: el}
    el.attr('draggable', true)
    fnDragDrop(el[0])
      .on('dragstart', function dragStart(e) {
        dragging.data = scope.$eval(attrs.fnDrag)
        dragging.source = scope.$eval(attrs.fnSource)

        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
        $rootScope.$emit('fn-dragstart', dragging, e)
      })
      .on('dragend', function dragEnd() {
        $rootScope.$emit('fn-dragend', dragging)
      })
  }
})
