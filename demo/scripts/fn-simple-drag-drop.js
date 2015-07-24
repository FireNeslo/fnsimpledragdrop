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
    function onMove() {
      var touch, drag, target, i, over, dragstart;
      for (i = 0; i < event.changedTouches.length; i++) {
        touch = event.changedTouches[i];
        drag = drags[touch.identifier];
        target = elementAt(touch);
        if (drag.state === 'started') {
          dragstart = new CustomEvent('dragstart', { detail: touch.identifier });
          event.target.dispatchEvent(dragstart);
          drag.state = 'dragging';
        }
        if (!target) {
          continue;
        } else if (target !== drag.target) {
          if (drag.target)
            drag.target.dispatchEvent(new CustomEvent('dragleave'));
          target.dispatchEvent(new CustomEvent('dragenter'));
          drag.target = target;
        } else {
          over = new CustomEvent('dragover');
          over.dataTransfer = {};
          target.dispatchEvent(over);
        }
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
          for (var i = 0; i < event.changedTouches.length; i++) {
            drags[event.changedTouches[i].identifier] = { state: 'started' };
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
    return function api(element) {
      return { on: addEvent(element) };
    };
  }
]).directive('fnDragOver', [
  'fnDragDrop',
  function (fnDragDrop) {
    'use strict';
    return {
      restrict: 'A',
      require: '^fnDrop',
      link: function (scope, el, attrs, fnDrop) {
        fnDragDrop(el[0]).on('dragover', function onDragOver() {
          fnDrop.over(scope.$eval(attrs.fnDragOver));
        }).on('dragleave', function onDragLeave() {
          fnDrop.leave(scope.$eval(attrs.fnDragOver));
        });
      }
    };
  }
]).directive('fnDrag', [
  '$rootScope',
  'fnDragDrop',
  function ($rootScope, fnDragDrop) {
    'use strict';
    return function (scope, el, attrs) {
      var dragging = {
          element: el,
          data: {},
          source: {}
        };
      el.attr('draggable', true);
      fnDragDrop(el[0]).on('dragstart', function dragStart(e) {
        console.log(e, e.detail);
        dragging.data[e.detail] = scope.$eval(attrs.fnDrag);
        dragging.source[e.detail] = scope.$eval(attrs.fnSource);
        if (e.dataTransfer)
          e.dataTransfer.effectAllowed = 'move';
        $rootScope.$emit('fn-dragstart', dragging, e);
      }).on('dragend', function dragEnd() {
        $rootScope.$emit('fn-dragend', dragging);
      });
    };
  }
]).directive('fnDrop', [
  '$rootScope',
  'fnDragDrop',
  function ($rootScope, fnDragDrop) {
    'use strict';
    var dragging, over = null;
    $rootScope.$on('fn-dragstart', function (event, data) {
      dragging = data;
      angular.element(data.element).addClass('fn-dragging');
    });
    $rootScope.$on('fn-dragend', function (event, data) {
      dragging = null;
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
          scope.$apply(function () {
            scope.$eval(attrs.fnDrop, {
              $over: over,
              $data: dragging.data[e.detail],
              $source: dragging.source[e.detail],
              $target: scope.$eval(attrs.fnTarget)
            });
          });
        });
      },
      controller: [
        '$scope',
        function ($scope) {
          this.over = function (data) {
            over = data;
          };
          this.leave = function (data) {
            over = null;
          };
        }
      ]
    };
  }
]);}))