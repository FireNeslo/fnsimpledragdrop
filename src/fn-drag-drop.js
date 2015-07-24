factory('fnDragDrop', function fnDragDrop($rootElement) {
  var elements = []
  var dropped = []
  var touched = null
  var virtual = {}
  var drags = []

  function nativeDragDrop(el){
    return false
    return ('draggable' in el) || ('ondragstart' in el && 'ondrop' in el)
  }

  /* onEnd will not always fire when multitouching,
    therefore we have to check whether a touch event that no longer exist
    ended or not, and remove the drag image if it has.
  */
  function sanityCheck(touches){
    var touchIds = Array.prototype.slice.call(touches)
      .map(function(touch) {
        return touch.identifier
      })

    for (i = 0; i < drags.length; i++) {
      if (!drags[i] || touchIds.indexOf(i) >= 0) continue
      angular.element(api.dragging[i].image).remove()
      delete drags[i]
    }
  }

  function onEnd(event) {
    var touch, drag, i, drop, dragend, detail
    console.log(event.touches.length, event.changedTouches.length, event.targetTouches.length)
    for (i = 0; i < event.changedTouches.length; i++) {
      touch = event.changedTouches[i]
      drag = drags[touch.identifier]
      delete drags[touch.identifier]

      detail = {detail: touch.identifier, bubbles: true}

      if (!(drag && drag.state === 'dragging')) continue
      drag.state = 'dropped'

      if (drag.target) {
        drop = new CustomEvent('drop', detail)
        drag.target.dispatchEvent(drop)
      }
      dragend = new CustomEvent('dragend', detail)
      drag.source.dispatchEvent(dragend)
    }
  }

  function elementAt(touch) {
    var element, dimension
    for (var i = 0; i < elements.length; i++) {
      element = elements[i]
      dimension = element.getClientRects().item(0)
      if(dimension && (touch.clientX >= dimension.left &&
        touch.clientX <= (dimension.left + dimension.width) &&
        touch.clientY >= dimension.top &&
        touch.clientY <= (dimension.top + dimension.height))) {
        return element
      }
    }
  }

  function onMove() {
    var touch, drag, target, i, j, over, dragstart, detail, dragEvent
    for (i = 0; i < event.changedTouches.length; i++) {
      touch = event.changedTouches[i]
      drag = drags[touch.identifier]
      target = elementAt(touch)

      detail = {
        detail: touch.identifier,
        bubbles: true
      }

      if (!drag) continue

      if (drag.state === 'started'){
        sanityCheck(event.touches)
        dragstart = new CustomEvent('dragstart', detail)
        drag.source.dispatchEvent(dragstart)
        drag.state = 'dragging'
      }

      if (drag.state !== 'dragging') continue

      dragEvent = new CustomEvent('drag', {detail: touch.identifier})
      dragEvent.clientX = touch.clientX
      dragEvent.clientY = touch.clientY

      for (j = 0; j < elements.length; j++) {
        elements[j].dispatchEvent(dragEvent)
      }

      if (!target) continue

      if (target !== drag.target) {
        if (drag.target) {
          drag.target.dispatchEvent(new CustomEvent('dragleave', detail))
        }
        target.dispatchEvent(new CustomEvent('dragenter', detail))
        drag.target = target
      }

      over = new CustomEvent('dragover', detail)
      over.dataTransfer = {}
      target.dispatchEvent(over)
    }
  }

  function observeElement(attach, element) {
    if(elements.indexOf(element) < 0) {
      elements.push(element)
    }
    elements.sort(function(a, b) {
      if(a.contains(b)) return 1
      else return 0
    })
  }

  if(!nativeDragDrop($rootElement[0])) {
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    window.addEventListener('touchmove', onMove)

    'dragleave dragenter dragover drag drop'.split(' ').forEach(function(ev) {
      virtual[ev] = observeElement
    })

    virtual.dragstart = function(attach, element) {
      attach('touchstart', function(event) {
        event.preventDefault()
        var touch, drag, i
        for (i = 0; i < event.changedTouches.length; i++) {
          touch = event.changedTouches[i]
          drag = api.dragging[touch.identifier]
          if (drag) angular.element(drag.image).remove()

          drags[touch.identifier] = {
            state: 'started',
            source: event.target
          }
        }
      })
    }
  }

  function addEvent(element) {
    var attach = element.addEventListener.bind(element);
    return function on(event, callback) {
      if(virtual[event]) virtual[event](attach, element)
      attach(event, callback)
      return this
    }
  }

  function api(element) {
    return {
      on: addEvent(element)
    }
  }

  api.dragging = []
  return api
})
