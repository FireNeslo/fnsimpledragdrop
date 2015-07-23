directive('fnDrag', function ($rootScope) {
  'use strict'
  function hasDragDrop(el){
    return false
    return ('draggable' in el) || ('ondragstart' in el && 'ondrop' in el)
  }

  return function (scope, el, attrs) {
    el.attr('draggable', true)
    var on = el[0].addEventListener.bind(el[0])
    var dragging = {element: el}

    function dragStart(e) {
      dragging.data = scope.$eval(attrs.fnDrag)
      dragging.source = scope.$eval(attrs.fnSource)

      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
      $rootScope.$emit('fn-dragstart', dragging, e)
    }

    function dragEnd() {
      $rootScope.$emit('fn-dragend', dragging)
    }

    if (hasDragDrop(el[0])) {
      on('dragstart', dragStart)
      on('dragend', dragEnd)
    } else {
      on('touchstart', dragStart)
      on('touchend', dragEnd)
    }
  }
})
