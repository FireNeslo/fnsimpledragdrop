(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    factory();
  }
}(this, function () {
  return angular.module('fnSimpleDragDrop', []).directive('fnDragOver', function () {
    'use strict';
    return {
      restrict: 'A',
      require: '^fnDrop',
      link: function (scope, el, attrs, fnDrop) {
        var on = el[0].addEventListener.bind(el[0]);
        on('dragover', function () {
          fnDrop.over(scope.$eval(scope[attrs['fnDragOver']]));
        });
        on('dragleave', function () {
          fnDrop.leave(scope.$eval(scope[attrs['fnDragOver']]));
        });
      }
    };
  }).directive('fnDrag', ['$rootScope', function ($rootScope) {
    'use strict';
    return function (scope, el, attrs) {
      el.attr('draggable', true);
      var on = el[0].addEventListener.bind(el[0]),
          dragging = {
          element: el
          };

      function dragStart(e) {
        dragging.data = scope.$eval(attrs.fnDrag);
        dragging.source = scope.$eval(attrs.fnSource);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setDragImage(el[0], 0, 0);
        $rootScope.$emit('fn-dragstart', dragging);
      }

      function dragEnd() {
        $rootScope.$emit('fn-dragend', dragging);
      }
      on('dragstart', dragStart, false);
      on('dragend', dragEnd, false);
    };
  }]).directive('fnDrop', ['$rootScope', function ($rootScope) {
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
        var on = el[0].addEventListener.bind(el[0]);
        on('dragover', function (e) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
        }, false);
        on('dragenter', function (e) {
          el.addClass('fn-over');
        }, false);
        on('dragleave', function (e) {
          el.removeClass('fn-over');
        }, false);
        on('drop', function (e) {
          e.preventDefault();
          scope.$apply(function () {
            scope.$eval(attrs.fnDrop, {
              $over: over,
              $data: dragging.data,
              $source: dragging.source,
              $target: scope.$eval(attrs.fnTarget)
            });
            el.removeClass('fn-over');
          });
        }, false);
      },
      controller: ['$scope', function ($scope) {
        this.over = function (data) {
          over = data;
        };
        this.leave = function (data) {
          over = null;
        };
      }]
    };
  }]);
}));