(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory)} else if (typeof exports === 'object') {module.exports = factory()} else {factory()}}(this, function () {	return angular.module('fnSimpleDragDrop', []).factory('fnDragDrop', [
  '$rootElement',
  function fnDragDrop($rootElement) {
    var elements = [];
    var dropped = [];
    var touched = null;
    var virtual = {};
    var drags = {};
    function nativeDragDrop(el) {
      return false;
      return 'draggable' in el || 'ondragstart' in el && 'ondrop' in el;
    }
    function onEnd(event) {
      var touch, drag, i, drop;
      for (i = 0; i < event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        drag = drags[touch.identifier];
        if (drag.state !== 'dragging')
          continue;
        drag.state = 'dropped';
        if (drag.target) {
          drop = new CustomEvent('drop', {
            detail: touch.identifier,
            bubbles: true
          });
          drag.target.dispatchEvent(drop);
        }
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
    function dragImage(touch, drag, target) {
      return function (image) {
        drag.image = image.cloneNode(true);
        drag.image.style.position = 'static';
        drag.image.style.z = 'static';
        drag.image.classList.add('fn-drag-image');
      };
    }
    function onMove() {
      var touch, drag, target, i, over, dragstart, detail;
      for (i = 0; i < event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        drag = drags[touch.identifier];
        target = elementAt(touch);
        detail = {
          detail: touch.identifier,
          bubbles: true
        };
        if (drag.state === 'started') {
          dragstart = new CustomEvent('dragstart', detail);
          drag.source.dispatchEvent(dragstart);
          drag.state = 'dragging';
          if (!drag.setDragImage) {
            drag.setDragImage = dragImage(touch, drag, target);
          }
        }
        if (!(drag.state === 'dragging' && target))
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
    if (!nativeDragDrop($rootElement[0])) {
      $rootElement[0].addEventListener('touchend', onEnd);
      $rootElement[0].addEventListener('touchcancel', onEnd);
      $rootElement[0].addEventListener('touchmove', onMove);
      var observeElement = virtual.dragleave = virtual.dragenter = virtual.dragover = virtual.drop = function observeElement(attach, element) {
          if (elements.indexOf(element) < 0) {
            elements.push(element);
          }
          elements.sort(function (a, b) {
            if (a.contains(b))
              return 1;
            else
              return 0;
          });
        };
      virtual.dragstart = function (attach, element) {
        attach('touchstart', function (event) {
          event.preventDefault();
          console.log(event.target.textContent);
          for (var i = 0; i < event.changedTouches.length; i++) {
            drags[event.changedTouches[i].identifier] = {
              state: 'started',
              source: event.target
            };
          }
        });
      };
      virtual.dragend = function (attach, element) {
        function onEnd(event) {
          setTimeout(function () {
            var touch, drag, dragend;
            for (var i = 0; i < event.changedTouches.length; i++) {
              touch = event.changedTouches[i];
              drag = drags[touch.identifier];
              if (drag.state === 'dropped') {
                dragend = new CustomEvent('dragend', { detail: touch.identifier });
                event.target.dispatchEvent(dragend);
              } else {
                drag.state = 'cancelled';
              }
            }
          });
        }
        attach('touchend', onEnd);
        attach('touchcancel', onEnd);
      };
    }
    function addEvent(element) {
      var attach = element.addEventListener.bind(element);
      return function on(event, callback) {
        if (virtual[event])
          virtual[event](attach, element);
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
      }).on('dragend', function dragEnd(e) {
        var dragging = fnDragDrop.dragging[e.detail];
        $rootScope.$emit('fn-dragend', dragging, e);
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