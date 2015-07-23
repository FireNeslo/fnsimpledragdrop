factory('fnDragDrop', function fnDragDrop($rootElement) {
  var hovering = null
  var elements = []
  var dropped = []
  var touched = null
  var virtual = {}

  function nativeDragDrop(el){
    return ('draggable' in el) || ('ondragstart' in el && 'ondrop' in el)
  }

  function onEnd(event) {
    var drop = new Event('drop')
    hovering.dispatchEvent(drop)
    while(hovering = hovering.parentNode){
      hovering.dispatchEvent(drop)
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
    var target = elementAt(event.touches[0])
    if(!target) return
    if(target !== hovering) {
      if(hovering) hovering.dispatchEvent(new Event('dragleave'))
      target.dispatchEvent(new Event('dragenter'))
      hovering = target
    } else {
      var over = new Event('dragover')
      over.dataTransfer = {}
      target.dispatchEvent(over)
    }

  }
  if(!nativeDragDrop($rootElement[0])) {
    console.log('virtual')
    $rootElement.on('touchend', onEnd)
    $rootElement.on('touchcancel', onEnd)
    $rootElement.on('touchmove', onMove)

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
        event.target.dispatchEvent(new Event('dragstart'))
      })
    }
    virtual.dragend = function(attach, element) {
      function onEnd(event) {
        setTimeout(function() {
          event.target.dispatchEvent(new Event('dragend'))
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
      attach(event, function(e) {
        console.log(event)
        callback(e)
      })
      return this
    }
  }

  return function api(element) {
    return {
      on: addEvent(element)
    }
  }
})
