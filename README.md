#Position

将元素定位于window, document或某个元素

---


##使用说明

###`Position(myObject[, targetObject])`

定位方法

**参数**

1. `myObject` - *(object|element)* 需要定位的元素
2. `targetObject` - *(object|element)* 目标元素

这两个参数的格式：

- `object`

偏移值


例子：
```js
define(function(require, exports, module) {
    var Position = require('position');

    // #my1 定位到 #taget1 元素上,
    Position('#my1', {element: '#target1', pos: '50px 50px'});
});
```
