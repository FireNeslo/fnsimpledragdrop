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
        if (!dragging.image) dragging.image = dragging.element.cloneNode(true)
        dragging.image.style.position = 'fixed'
        dragging.image.classList.add('fn-dragging-image')
        dragging.image.style.left = 0
        dragging.image.style.top = 0
        delete dragging.image.id
        document.body.appendChild(dragging.image)
      })
      .on('dragend', function dragEnd(e) {
        var dragging = fnDragDrop.dragging[e.detail]
        $rootScope.$emit('fn-dragend', dragging, e)
        document.body.removeChild(dragging.image)
      })
      .on('drag', function drag(e) {
        var dragging = fnDragDrop.dragging[e.detail]
        $rootScope.$emit('fn-drag', dragging, e)
        dragging.image.style.transform =
          'translate(' + e.clientX + 'px, ' + e.clientY + 'px)'
      })
  }
})
