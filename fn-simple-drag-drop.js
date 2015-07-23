(function (root, factory) {if (typeof define === 'function' && define.amd) {define([], factory)} else if (typeof exports === 'object') {module.exports = factory()} else {factory()}}(this, function () {	return angular.module('fnSimpleDragDrop', []).directive('fnDragOver', function () {
  'use strict';
  return {
    restrict: 'A',
    require: '^fnDrop',
    link: function (scope, el, attrs, fnDrop) {
      var on = el[0].addEventListener.bind(el[0]);
      on('dragover', function () {
        fnDrop.over(scope.$eval(attrs.fnDragOver));
      });
      on('dragleave', function () {
        fnDrop.leave(scope.$eval(attrs.fnDragOver));
      });
    }
  };
}).directive('fnDrag', [
  '$rootScope',
  function ($rootScope) {
    'use strict';
    function hasDragDrop(el) {
      return false;
      return 'draggable' in el || 'ondragstart' in el && 'ondrop' in el;
    }
    return function (scope, el, attrs) {
      el.attr('draggable', true);
      var on = el[0].addEventListener.bind(el[0]);
      var dragging = { element: el };
      function dragStart(e) {
        dragging.data = scope.$eval(attrs.fnDrag);
        dragging.source = scope.$eval(attrs.fnSource);
        if (e.dataTransfer)
          e.dataTransfer.effectAllowed = 'move';
        $rootScope.$emit('fn-dragstart', dragging, e);
      }
      function dragEnd() {
        $rootScope.$emit('fn-dragend', dragging);
      }
      if (hasDragDrop(el[0])) {
        on('dragstart', dragStart);
        on('dragend', dragEnd);
      } else {
        on('touchstart', dragStart);
        on('touchend', dragEnd);
      }
    };
  }
]).directive('fnDrop', [
  '$rootScope',
  function ($rootScope) {
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
        var on = el[0].addEventListener.bind(el[0]);
        on('dragover', function (e) {
          e.stopPropagation();
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        });
        on('dragenter', function (e) {
          id++;
          e.stopPropagation();
          e.preventDefault();
          el.addClass('fn-over');
        });
        on('dragleave', function (e) {
          id--;
          e.stopPropagation();
          e.preventDefault();
          if (id === 0) {
            el.removeClass('fn-over');
          }
        });
        on('drop', function (e) {
          id = 0;
          e.preventDefault();
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