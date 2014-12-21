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
<ul class="list-inline well"
    fn-target="source"
    fn-drop="drop($source, $target, $data, $over)">
    <li fn-drag="data"
        fn-source="source"
        fn-drag-over="$index"
        ng-repeat="data in source track by $index">
        {{data}}
    </li>
</ul>
<ul class="list-inline well"
    fn-target="target"
    fn-drop="drop($source, $target, $data, $over)">
    <li fn-drag="data"
        fn-source="target"
        fn-drag-over="$index"
        ng-repeat="data in target track by $index">
        {{data}}
    </li>
</ul>
```

### Controller

```js
angular
.module('fnSimpleDragDropApp', ['fnSimpleDragDrop'])
.controller('MainCtrl', function ($scope) {
  $scope.source = ['hello','guys','fun','with','drag','and','drop','is','it','not?'];
  $scope.target = [];
  $scope.drop = function(from, to, data, position) {
    from.splice(from.indexOf(data),1);
    to.splice(position!=null?position:to.length,0, data);
  };
});
```

## Install

### bower
``` bash
$ bower install FireNeslo/fnsimpledragdrop --save
```

### demo [http://fireneslo.github.io/fnsimpledragdrop/](http://fireneslo.github.io/fnsimpledragdrop/)
``` bash
$ git clone https://github.com/FireNeslo/fnsimpledragdrop.git
$ cd fnsimpledragdrop
$ npm install && bower install
$ gulp demo
```

## Documentation

#### fn-drop="fn($data, $over, $target, $source)" class="fn-over"
Lets you attach an on-drop function that provides these arguments (not position sensitive)
<dl>
  <dt>$data</dt>
  <dd>data being dropped see fn-drag</dd>
  <dt>$over [optional]</dt>
  <dd>additonal data from child elements of fn-drop to attach see fn-drag-over</dd>
  <dt>$target [optional]</dt>
  <dd>defined target element for drop operation see fn-target</dd>
  <dt>$source [optional]</dt>
  <dd>source defined on the data being dragged see fn-source</dd>
</dl>

#### fn-drag="$data" class="fn-dragging"
Simply lets you drag the element and let you attach some data to that element.
<dl>
  <dt>$data</dt>
  <dd>data being dragged</dd>
</dl>


#### fn-drag-over="$over" [optional]
Lets you add additional info to the drop event. (must be a child of fn-drop)
<dl>
  <dt>$over</dt>
  <dd>additonal data for drop event</dd>
</dl>

#### fn-target="$target" [optional]
Lets you add target data to drop event. (must be on same element as fn-drop)
<dl>
  <dt>$target</dt>
  <dd>the current target data for the drop event</dd>
</dl>

#### fn-source="$source" [optional]
Lets you add source data to drop event. (must be on same element as fn-drag)
<dl>
  <dt>$source</dt>
  <dd>the current source data for the drop event</dd>
</dl>


### Events
fn drag drop uses these events internally
#### $rootScope.$on('fn-dragstart', dragStart)
<dl>
  <dt>dragStart($event, {data,source,target,element})</dt>
  <dd>fires on dragstart</dd>
</dl>

#### $rootScope.$on('fn-dragend', dragEnd)
<dl>
  <dt>dragEnd($event, {data,source,target,over,element})</dt>
  <dd>fires on dragend</dd>
</dl>