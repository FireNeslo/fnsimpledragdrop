# introduction
I think it would be neat to have a simple filesystem for the browser.

## Requirements
* [nodejs](http://nodejs.org)
* [bower](http://bower.io)
* [gulp](http://gulpjs.com)

## Usage

### View

```html
<div ng-controller="MainCtrl">
  <ul class="list-inline well" fn-drop="drop(target, source, data, over)">
    <li fn-drag-over="$index" fn-drag="data" ng-repeat="data in source track by $index">{{data}}</li>
  </ul>
  <ul class="list-inline well" fn-drop="drop(source, target, data, over)">
    <li fn-drag-over="$index" fn-drag="data" ng-repeat="data in target track by $index">{{data}}</li>
  </ul>
</div>
```
### Controller

```js
angular
.module('fnSimpleDragDropApp', ['fnSimpleDragDrop'])
.controller('MainCtrl', function ($scope) {
  $scope.source = ['hello','guys','fun','with','drag','and','drop','is','it','not?'];
  $scope.target = [];
  $scope.drop = function(from, to, data, $index) {
    $index === undefined && ($index = to.length);
    var index = from.indexOf(data), temp;
    if(index < 0) {
      from = to;
      index = from.indexOf(data);
    }
    if(index > -1) {
      from.splice(index,1);
      to.splice($index,0, data);
    }
  };
});
```

## Install

### bower
``` bash
$ bower install FireNeslo/fnsimpledragdrop.git --save
```

### demo
``` bash
$ git clone https://github.com/FireNeslo/fnsimpledragdrop.git
$ cd fnsimpledragdrop
$ npm install && bower install
$ gulp demo
```