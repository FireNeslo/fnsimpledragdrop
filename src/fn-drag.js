directive('fnDrag', function ($rootScope, fnDragDrop) {
  'use strict'
  return function (scope, elements, attrs) {
    elements.attr('draggable', true)
    fnDragDrop(elements[0])
      .on('dragstart', function dragStart(e) {
        var dragging = fnDragDrop.dragging[e.detail] = {
          element: elements[0],
          data: scope.$eval(attrs.fnDrag),
          source: scope.$eval(attrs.fnSource)
        }

        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
        $rootScope.$emit('fn-dragstart', dragging, e)
      })
      .on('dragend', function dragEnd(e) {
        var dragging = fnDragDrop.dragging[e.detail]
        $rootScope.$emit('fn-dragend', dragging, e)
      })
  }
})
