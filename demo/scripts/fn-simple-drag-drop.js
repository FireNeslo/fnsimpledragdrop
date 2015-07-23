(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory)} else if (typeof exports === 'object') {module.exports = factory()} else {factory()}}(this, function () {	return angular.module('fnSimpleDragDrop', []).factory('fnDragDrop', [
  '$rootElement',
  function fnDragDrop($rootElement) {
    var hovering = null;
    var elements = [];
    var dropped = [];
    var touched = null;
    var virtual = {};
    function nativeDragDrop(el) {
      return 'draggable' in el || 'ondragstart' in el && 'ondrop' in el;
    }
    function onEnd(event) {
      var drop = new Event('drop');
      hovering.dispatchEvent(drop);
      while (hovering = hovering.parentNode) {
        hovering.dispatchEvent(drop);
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
      var target = elementAt(event.touches[0]);
      if (!target)
        return;
      if (target !== hovering) {
        if (hovering)
          hovering.dispatchEvent(new Event('dragleave'));
        target.dispatchEvent(new Event('dragenter'));
        hovering = target;
      } else {
        var over = new Event('dragover');
        over.dataTransfer = {};
        target.dispatchEvent(over);
      }
    }
    if (!nativeDragDrop($rootElement[0])) {
      console.log('virtual');
      $rootElement.on('touchend', onEnd);
      $rootElement.on('touchcancel', onEnd);
      $rootElement.on('touchmove', onMove);
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
          event.target.dispatchEvent(new Event('dragstart'));
        });
      };
      virtual.dragend = function (attach, element) {
        function onEnd(event) {
          setTimeout(function () {
            event.target.dispatchEvent(new Event('dragend'));
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
        attach(event, function (e) {
          console.log(event);
          callback(e);
        });
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
          debugger;
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
      var dragging = { element: el };
      el.attr('draggable', true);
      fnDragDrop(el[0]).on('dragstart', function dragStart(e) {
        dragging.data = scope.$eval(attrs.fnDrag);
        dragging.source = scope.$eval(attrs.fnSource);
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
              $data: dragging.data,
              $source: dragging.source,
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