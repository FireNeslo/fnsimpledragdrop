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
          fnDrop.over(scope[attrs['fnDragOver']]);
          scope.$apply();
        });
        on('dragleave', function () {
          fnDrop.leave(scope[attrs['fnDragOver']]);
          scope.$apply();
        });
      }
    };
  }).directive('fnDrag', ['$rootScope', function ($rootScope) {
    'use strict';
    return {
      restrict: 'A',
      scope: {
        onDrag: '&',
        fnDrag: '='
      },
      link: function (scope, el, attrs) {
        el.attr('draggable', true);
        var on = el[0].addEventListener.bind(el[0]),
            dragging = {
            element: el,
            data: scope.fnDrag
            };
        scope.$watch('fnDrag', function (data) {
          dragging.data = data;
        });

        function dragStart(e) {
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setDragImage(el[0], 0, 0);
          scope.onDrag({
            dragEl: el,
            data: scope.draggable
          });
          $rootScope.$emit('fn-dragstart', dragging);
        }

        function dragEnd() {
          $rootScope.$emit('fn-dragend', dragging);
        }
        on('dragstart', dragStart, false);
        on('dragend', dragEnd, false);
      }
    };
  }]).directive('fnDrop', ['$rootScope', function ($rootScope) {
    'use strict';
    var dragging;
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
      scope: {
        fnDrop: '&'
      },
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
          scope.fnDrop({
            over: scope.over,
            data: dragging.data
          });
          el.removeClass('fn-over');
          scope.$apply();
        }, false);
      },
      controller: ['$scope', function ($scope) {
        this.over = function (data) {
          $scope.over = data;
        };
        this.leave = function (data) {
          $scope.over = undefined;
        };
      }]
    };
  }]);
}));