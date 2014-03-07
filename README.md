#Position

将元素定位于window, document或某个元素

---


##使用说明

###`Position(myObject[, targetObject])`

定位方法

**参数**

1. `myObject` - *(object|element)* 需要定位的元素，必填
2. `targetObject` - *(object|element)* 目标元素，可选，如果没有传入，会默认使用当前可视范围

这两个参数的格式：

- `object`



##例子：

```js
    // 基本定位，4种实现效果都是一样
    Position('#my', '#target');
    Position({element: '#my'}, {element: '#target'});
    Position({element: '#my', pos: '0 0'}, {element: '#target', pos: '0 0'});
    Position({element: '#my', pos: 'left top'}, {element: '#target', pos: 'left top'});

    // #my 定位到 #taget1 元素上, #taget 坐标点偏移 x:50px  y:50p
    Position('#my', {element: '#target', pos: '50px 50px'});

    // #my 定位到 #taget 元素上
    // #my 坐标点偏移 x:150px  y:150px
    // #taget 坐标点偏移 x:50px  y:50px
    Position({element: '#my', pos: '150px 150px'}, {element: '#target', pos: '50px 50px'});

    // 组合计算
    Position({element: '#my', pos: 'right+10px 50%*1.5'}, {element: '#target', pos: 'right-1 -50px/2'});

    // 简写
    Position({element: '#my', pos: 'center'}, {element: '#target', pos: 'center'});
```
