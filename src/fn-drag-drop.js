factory('fnDragDrop', function fnDragDrop($rootElement) {
  var elements = []
  var dropped = []
  var touched = null
  var virtual = {}
  var drags = {}

  function nativeDragDrop(el){
    return false
    return ('draggable' in el) || ('ondragstart' in el && 'ondrop' in el)
  }

  function onEnd(event) {
    var touch, drag, i, drop
    for (i = 0; i < event.changedTouches.length; i++) {
      touch = event.changedTouches[i]
      drag = drags[touch.identifier]
      if (drag.state !== 'dragging') continue
      drag.state = 'dropped'
      if (drag.target) {
        drop = new CustomEvent('drop', {detail: touch.identifier, bubbles: true})
        drag.target.dispatchEvent(drop)
      }
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
    var touch, drag, target, i, over, dragstart
    for (i = 0; i < event.changedTouches.length; i++) {
      touch = event.changedTouches[i]
      drag = drags[touch.identifier]
      target = elementAt(touch)

      if (drag.state === 'started'){
        dragstart = new CustomEvent('dragstart', {detail: touch.identifier})
        drag.source.dispatchEvent(dragstart)
        drag.state = 'dragging'
      }

      if (!target) {
        continue
      } else if (target !== drag.target) {
        if (drag.target) drag.target.dispatchEvent(new CustomEvent('dragleave'))
        target.dispatchEvent(new CustomEvent('dragenter'))
        drag.target = target
      } else {
        over = new CustomEvent('dragover', {detail: touch.identifier})
        over.dataTransfer = {}
        target.dispatchEvent(over)
      }
    }
  }
  if(!nativeDragDrop($rootElement[0])) {
    $rootElement[0].addEventListener('touchend', onEnd)
    $rootElement[0].addEventListener('touchcancel', onEnd)
    $rootElement[0].addEventListener('touchmove', onMove)

    var observeElement = virtual.dragleave = virtual.dragenter =
    virtual.dragover = virtual.drop = function observeElement(attach, element) {
      if(elements.indexOf(element) < 0) {
        elements.push(element)
      }
      elements.sort(function(a, b) {
        if(a.contains(b)) return 1
        else return 0
      })
    }
    virtual.dragstart = function(attach, element) {
      attach('touchstart', function(event) {
        event.preventDefault()
        console.log(event.target.textContent)
        for (var i = 0; i < event.changedTouches.length; i++) {
          drags[event.changedTouches[i].identifier] = {
            state: 'started',
            source: event.target
          }
        }
      })
    }
    virtual.dragend = function(attach, element) {
      function onEnd(event) {
        setTimeout(function() {
          var touch, drag, dragend
          for (var i = 0; i < event.changedTouches.length; i++) {
            touch = event.changedTouches[i]
            drag = drags[touch.identifier]
            if (drag.state === 'dropped'){
              dragend = new CustomEvent('dragend', {detail: touch.identifier})
              event.target.dispatchEvent(dragend)
            } else {
              drag.state = 'cancelled'
            }
          }
        })
      }
      attach('touchend', onEnd)
      attach('touchcancel', onEnd)
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
