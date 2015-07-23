directive('fnDragOver', function (fnDragDrop) {
  'use strict'
  return {
    restrict: 'A',
    require: '^fnDrop',
    link: function (scope, el, attrs, fnDrop) {
      fnDragDrop(el[0])
        .on("dragover", function onDragOver() {
          debugger
          fnDrop.over(scope.$eval(attrs.fnDragOver))
        })
        .on("dragleave", function onDragLeave() {
          fnDrop.leave(scope.$eval(attrs.fnDragOver))
        })
    }
  }
})
