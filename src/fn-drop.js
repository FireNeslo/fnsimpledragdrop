directive('fnDrop', function ($rootScope) {
  'use strict';
  var dragging, over = null;
  $rootScope.$on("fn-dragstart", function (event, data) {
    dragging = data;
    angular.element(data.element).addClass("fn-dragging");
  });

  $rootScope.$on("fn-dragend", function (event, data) {
    dragging = null;
    angular.element(data.element).removeClass("fn-dragging");
  });
  return {
    restrict: 'A',
    link: function (scope, el, attrs, controller) {
      var id = 0;
      var on = el[0].addEventListener.bind(el[0]);

      on("dragover", function (e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });
      on("dragenter", function (e) {
        id++;
        e.stopPropagation();
        e.preventDefault();
        el.addClass('fn-over');
      });
      on("dragleave", function (e) {
        id--;
        e.stopPropagation();
        e.preventDefault();
        if(id === 0) {
          el.removeClass('fn-over');
        }
      });

      on("drop", function (e) {
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
    controller: function ($scope) {
      this.over = function (data) {
        over = data;
      };
      this.leave = function (data) {
        over = null;
      };
    }
  }
})