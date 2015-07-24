directive('fnDrop', function ($rootScope, fnDragDrop) {
  'use strict'
  var over = null
  $rootScope.$on("fn-dragstart", function (event, data) {
    angular.element(data.element).addClass("fn-dragging")
  })

  $rootScope.$on("fn-dragend", function (event, data) {
    angular.element(data.element).removeClass("fn-dragging")
  })
  return {
    restrict: 'A',
    link: function (scope, el, attrs, controller) {
      var id = 0
      fnDragDrop(el[0])
        .on("dragover", function (e) {
          e.stopPropagation()
          e.preventDefault()
          e.dataTransfer.dropEffect = 'move'
        })
        .on("dragenter", function (e) {
          id++
          e.stopPropagation()
          e.preventDefault()
          el.addClass('fn-over')
        })
        .on("dragleave", function (e) {
          id--
          e.stopPropagation()
          e.preventDefault()
          if (id === 0) {
            el.removeClass('fn-over')
          }
        })
        .on("drop", function (e) {
          id = 0
          e.preventDefault()
          e.stopPropagation()
          el.removeClass('fn-over')
          scope.$applyAsync(function () {
            var data = fnDragDrop.dragging[e.detail]
            scope.$eval(attrs.fnDrop, {
              $over: data.over,
              $data: data.data,
              $source: data.source,
              $target: scope.$eval(attrs.fnTarget)
            })
          })
        })
    }
  }
})
