# introduction
I really liked [logicbomb/lvldragdrop](https://github.com/logicbomb/lvldragdrop).
but there was a problem it used elements, and that i could simply not have.
that is why i decided to create a directive that removes any need for dom and let det data take control.

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

#### fn-drag
Simply lets you drag the element and let you attach some data to that element.

#### fn-drop
Lets you attach an ondro function that provides to arguments data and over

* over: is the data provided by the fn-drag-over directive or undefined if no value is provided
* data: is the data that is dropped

#### fn-drag-over
Lets you add additional info to the drop directive about where it whas dropped

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

#### online [http://fireneslo.github.io/fnsimpledragdrop/](http://fireneslo.github.io/fnsimpledragdrop/)
``` bash
$ git clone https://github.com/FireNeslo/fnsimpledragdrop.git
$ cd fnsimpledragdrop
$ npm install && bower install
$ gulp demo
```