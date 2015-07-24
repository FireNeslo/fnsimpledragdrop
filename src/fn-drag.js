directive('fnDrag', function ($rootScope, fnDragDrop) {
  'use strict'
  return function (scope, el, attrs) {
    var dragging = {element: el, data: {}, source: {}}
    el.attr('draggable', true)
    fnDragDrop(el[0])
      .on('dragstart', function dragStart(e) {
        console.log(e, e.detail)
        dragging.data[e.detail] = scope.$eval(attrs.fnDrag)
        dragging.source[e.detail] = scope.$eval(attrs.fnSource)

        if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
        $rootScope.$emit('fn-dragstart', dragging, e)
      })
      .on('dragend', function dragEnd() {
        $rootScope.$emit('fn-dragend', dragging)
      })
  }
})
