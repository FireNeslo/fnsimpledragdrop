(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory)} else if (typeof exports === 'object') {module.exports = factory()} else {factory()}}(this, function () {	return angular.module('fnSimpleDragDrop', []).factory('fnDragDrop', [
  '$q',
  function fnDragDrop($q) {
    var elements = [];
    var dropped = [];
    var touched = null;
    var virtual = $q.defer();
    var drags = [];
    /* onEnd will not always fire when multitouching,
    therefore we have to check whether a touch event that no longer exist
    ended or not, and remove the drag image if it has.
  */
    function sanityCheck(touches) {
      var touchIds = Array.prototype.slice.call(touches).map(function (touch) {
          return touch.identifier;
        });
      for (i = 0; i < drags.length; i++) {
        if (!drags[i] || touchIds.indexOf(i) >= 0)
          continue;
        angular.element(api.dragging[i].image).remove();
        delete drags[i];
      }
    }
    function onEnd(event) {
      var touch, drag, i, drop, dragend, detail;
      for (i = 0; i < event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        drag = drags[touch.identifier];
        delete drags[touch.identifier];
        detail = {
          detail: touch.identifier,
          bubbles: true
        };
        if (!(drag && drag.state === 'dragging'))
          continue;
        drag.state = 'dropped';
        if (drag.target) {
          drop = new CustomEvent('drop', detail);
          drag.target.dispatchEvent(drop);
        }
        dragend = new CustomEvent('dragend', detail);
        drag.source.dispatchEvent(dragend);
      }
    }
    function elementAt(touch) {
      var element, dimension;
      for (var i = 0; i < elements.length; i++) {
        element = elements[i];
        dimension = element.getClientRects().item(0);
        if (dimension && (touch.clientX >= dimension.left && touch.clientX <= dimension.left + dimension.width && touch.clientY >= dimension.top && touch.clientY <= dimension.top + dimension.height)) {
          return element;
        }
      }
    }
    function onMove() {
      var touch, drag, target, i, j, over, dragstart, detail, dragEvent;
      for (i = 0; i < event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        drag = drags[touch.identifier];
        target = elementAt(touch);
        detail = {
          detail: touch.identifier,
          bubbles: true
        };
        if (!drag)
          continue;
        if (drag.state === 'started') {
          sanityCheck(event.touches);
          dragstart = new CustomEvent('dragstart', detail);
          drag.source.dispatchEvent(dragstart);
          drag.state = 'dragging';
        }
        if (drag.state !== 'dragging')
          continue;
        dragEvent = new CustomEvent('drag', { detail: touch.identifier });
        dragEvent.clientX = touch.clientX;
        dragEvent.clientY = touch.clientY;
        for (j = 0; j < elements.length; j++) {
          elements[j].dispatchEvent(dragEvent);
        }
        if (!target)
          continue;
        if (target !== drag.target) {
          if (drag.target) {
            drag.target.dispatchEvent(new CustomEvent('dragleave', detail));
          }
          target.dispatchEvent(new CustomEvent('dragenter', detail));
          drag.target = target;
        }
        over = new CustomEvent('dragover', detail);
        over.dataTransfer = {};
        target.dispatchEvent(over);
      }
    }
    function observeElement(attach, element) {
      if (elements.indexOf(element) < 0) {
        elements.push(element);
      }
      elements.sort(function (a, b) {
        if (a.contains(b))
          return 1;
        else
          return 0;
      });
    }
    /* Drag-and-Drop is basically undetectable.
    Polyfill as soon as touch events happen. */
    window.addEventListener('touchstart', function polyfill(event) {
      event.preventDefault();
      window.removeEventListener('touchstart', polyfill);
      window.addEventListener('touchend', onEnd);
      window.addEventListener('touchcancel', onEnd);
      window.addEventListener('touchmove', onMove);
      'dragleave dragenter dragover drag drop'.split(' ').forEach(function (ev) {
        virtual[ev] = observeElement;
      });
      virtual.dragstart = function (attach, element) {
        attach('touchstart', function (event) {
          event.preventDefault();
          var touch, drag, i;
          for (i = 0; i < event.changedTouches.length; i++) {
            touch = event.changedTouches[i];
            drag = api.dragging[touch.identifier];
            if (drag)
              angular.element(drag.image).remove();
            drags[touch.identifier] = {
              state: 'started',
              source: event.target
            };
          }
        });
      };
      virtual.resolve(event);
    });
    function addEvent(element) {
      var attach = element.addEventListener.bind(element);
      return function on(event, callback) {
        virtual.promise.then(function ($event) {
          if (virtual[event])
            virtual[event](attach, element);
          return $event;
        }).then(function ($event) {
          if (event === 'dragstart' && element.contains($event.srcElement)) {
            element.dispatchEvent($event);
          }
        });
        attach(event, callback);
        return this;
      };
    }
    function api(element) {
      return { on: addEvent(element) };
    }
    api.dragging = [];
    return api;
  }
]).directive('fnDragOver', [
  'fnDragDrop',
  function (fnDragDrop) {
    'use strict';
    return {
      restrict: 'A',
      link: function (scope, el, attrs) {
        fnDragDrop(el[0]).on('dragover', function onDragOver(e) {
          fnDragDrop.dragging[e.detail].over = scope.$eval(attrs.fnDragOver);
        });
      }
    };
  }
]).directive('fnDrag', [
  '$rootScope',
  'fnDragDrop',
  function ($rootScope, fnDragDrop) {
    'use strict';
    return function (scope, elements, attrs) {
      elements.attr('draggable', true);
      fnDragDrop(elements[0]).on('dragstart', function dragStart(e) {
        var dragging = fnDragDrop.dragging[e.detail] = {
            element: elements[0],
            data: scope.$eval(attrs.fnDrag),
            source: scope.$eval(attrs.fnSource)
          };
        if (e.dataTransfer)
          e.dataTransfer.effectAllowed = 'move';
        $rootScope.$emit('fn-dragstart', dragging, e);
        if (!dragging.image)
          dragging.image = dragging.element.cloneNode(true);
        dragging.image.style.position = 'fixed';
        dragging.image.classList.add('fn-dragging-image');
        dragging.image.style.left = 0;
        dragging.image.style.top = 0;
        delete dragging.image.id;
        document.body.appendChild(dragging.image);
      }).on('dragend', function dragEnd(e) {
        var dragging = fnDragDrop.dragging[e.detail];
        $rootScope.$emit('fn-dragend', dragging, e);
        document.body.removeChild(dragging.image);
      }).on('drag', function drag(e) {
        var dragging = fnDragDrop.dragging[e.detail];
        $rootScope.$emit('fn-drag', dragging, e);
        dragging.image.style.transform = 'translate(' + e.clientX + 'px, ' + e.clientY + 'px)';
      });
    };
  }
]).directive('fnDrop', [
  '$rootScope',
  'fnDragDrop',
  function ($rootScope, fnDragDrop) {
    'use strict';
    var over = null;
    $rootScope.$on('fn-dragstart', function (event, data) {
      angular.element(data.element).addClass('fn-dragging');
    });
    $rootScope.$on('fn-dragend', function (event, data) {
      angular.element(data.element).removeClass('fn-dragging');
    });
    return {
      restrict: 'A',
      link: function (scope, el, attrs, controller) {
        var id = 0;
        fnDragDrop(el[0]).on('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }).on('dragenter', function (e) {
          id++;
          e.stopPropagation();
          e.preventDefault();
          el.addClass('fn-over');
        }).on('dragleave', function (e) {
          id--;
          e.stopPropagation();
          e.preventDefault();
          if (id === 0) {
            el.removeClass('fn-over');
          }
        }).on('drop', function (e) {
          id = 0;
          e.preventDefault();
          e.stopPropagation();
          el.removeClass('fn-over');
          scope.$applyAsync(function () {
            var data = fnDragDrop.dragging[e.detail];
            scope.$eval(attrs.fnDrop, {
              $over: data.over,
              $data: data.data,
              $source: data.source,
              $target: scope.$eval(attrs.fnTarget)
            });
          });
        });
      }
    };
  }
]);}))