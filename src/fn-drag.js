directive('fnDrag', function ($rootScope) {
  'use strict';
  return function (scope, el, attrs) {
    el.attr('draggable', true);
    var on = el[0].addEventListener.bind(el[0]);
    var dragging = {element: el};

    function dragStart(e) {
      dragging.data = scope.$eval(attrs.fnDrag);
      dragging.source = scope.$eval(attrs.fnSource);

      if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
      $rootScope.$emit('fn-dragstart', dragging, e);
    }

    function dragEnd() {
      $rootScope.$emit("fn-dragend", dragging);
    }

    on("dragstart", dragStart);
    on("dragend", dragEnd);
  };
})
