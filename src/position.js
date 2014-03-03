define(function(require, exports, module) {
    var $ = require('jquery');

    var isIE6 = (window.navigator.userAgent || '').toLowerCase().indexOf('msie 6') !== -1;

    var VIEWPORT = {_id: 'VIEWPORT', nodeType: 1};
    var isFixed;

    module.exports = function(myObject, targetObject) {
        if (!myObject) {
            error('myObject is invalid.');
        }

        targetObject = targetObject || {};
        targetObject.element = targetObject.element || VIEWPORT;

        // format to { element: jqElement, position: {x: 0, y: 0} }
        myObject = normalization(myObject);
        targetObject = normalization(targetObject);


        // 设定目标元素的 position 为绝对定位
        // 若元素的初始 position 不为 absolute，会影响元素的 display、宽高等属性
        var myElement = myObject.element;
        if (myElement.css('position') !== 'fixed' || isIE6) {
            myElement.css('position', 'absolute');
            isFixed = false;
        } else {
            // 定位 fixed 元素的标志位，下面有特殊处理
            isFixed = true;
        }


        // 获取尺寸及偏移值单位换算
        var itemsObject = [myObject, targetObject];
        var itemObj, itemDimensions;
        while (itemObj = itemsObject.shift()) {
            itemDimensions = getDimensions(itemObj.element);

            // 若定位 fixed 元素，则父元素的 offset 没有意义
            if (isFixed && !itemsObject.length) {
                itemObj.x = itemObj.y = 0;
            } else {
                // 相对于文档（document）的当前位置
                itemObj.x = itemDimensions.offset.left;
                itemObj.y = itemDimensions.offset.top;
            }

            // 计算真实的偏移值
            itemObj.offset = {
                x: calculateOffset(itemObj.position.x, itemDimensions.width),
                y: calculateOffset(itemObj.position.y, itemDimensions.height)
            };
        }

        var parentOffset = getParentOffset(myElement);

        var x = targetObject.x + targetObject.offset.x - myObject.offset.x - parentOffset.left;
        var y = targetObject.y + targetObject.offset.y - myObject.offset.y - parentOffset.top;

        myElement.css({
            left: x,
            top: y
        });
    };

    function toNumber(s) {
        return parseFloat(s, 10) || 0;
    }

    function error(msg) {
        throw new Error(msg);
    }

    // from: https://github.com/aralejs/position/blob/master/src/position.js
    // fix jQuery 1.7.2 offset
    // document.body 的 position 是 absolute 或 relative 时
    // jQuery.offset 方法无法正确获取 body 的偏移值
    //   -> http://jsfiddle.net/afc163/gMAcp/
    // jQuery 1.9.1 已经修正了这个问题
    //   -> http://jsfiddle.net/afc163/gMAcp/1/
    // 这里先实现一份
    // 参照 kissy 和 jquery 1.9.1
    //   -> https://github.com/kissyteam/kissy/blob/master/src/dom/sub-modules/base/src/base/offset.js#L366
    //   -> https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L28
    function getOffset(element) {
        var box = element.getBoundingClientRect(),
            win = window, doc = win.document,
            docBody = doc.body,
            docElem = doc.documentElement;

        // < ie8 不支持 win.pageXOffset, 则使用 docElem.scrollLeft
        return {
            left: box.left + (win.pageXOffset || docElem.scrollLeft) -
                (docElem.clientLeft || docBody.clientLeft  || 0),
            top: box.top  + (win.pageYOffset || docElem.scrollTop) -
                (docElem.clientTop || docBody.clientTop  || 0)
        };
    }

    // 获取 offsetParent 的位置
    function getParentOffset(element) {
        var doc = window.document;
        var docBody = doc.body;
        var parent = element.offsetParent();

        // IE7 下，body 子节点的 offsetParent 为 html 元素，其 offset 为
        // { top: 2, left: 2 }，会导致定位差 2 像素，所以这里将 parent
        // 转为 document.body
        if (parent[0] === doc.documentElement) {
            parent = $(docBody);
        }

        // 修正 ie6 下 absolute 定位不准的 bug
        if (isIE6) {
            parent.css('zoom', 1);
        }

        // 获取 offsetParent 的 offset
        var offset;

        // 当 offsetParent 为 body，
        // 而且 body 的 position 是 static 时
        // 元素并不按照 body 来定位，而是按 document 定位
        // http://jsfiddle.net/afc163/hN9Tc/2/
        // 因此这里的偏移值直接设为 0 0
        if (parent[0] === docBody &&
            parent.css('position') === 'static') {
            offset = { top:0, left: 0 };
        } else {
            offset = getOffset(parent[0]);
        }

        // 根据基准元素 offsetParent 的 border 宽度，来修正 offsetParent 的基准位置
        offset.top += toNumber(parent.css('border-top-width'));
        offset.left += toNumber(parent.css('border-left-width'));

        return offset;
    }

    function formatPosition(position) {
        position = String(position).toLowerCase();
        return position.replace(/top|right|bottom|left|center|px/ig, function(i) {
            if (i == 'right' || i == 'bottom') {
                return '100%';
            } else if (i == 'center') {
                return '50%';
            } else if (i == 'px') {
                return '';
            }

            return 0;
        });
    }

    /**
     * 规范化:
     *     确保element是jquery独享
     *     position类似css position的格式
     *
     * @param obj
     * @returns {{element: *, position: {x: *, y: *}}}
     */
    function normalization(obj) {
        // element
        var $element = obj.element || obj;
        if (!($element instanceof $)) {
            $element = $($element);
        }

        if (!$element[0] || ($element[0].nodeType > 1 && $element[0].nodeType < 9)) {
            error('element is invalid.');
        }


        // position
        var pos = (obj.pos || '').split(' ');
        if (pos[0] && pos.length === 1) {
            if (/top|bottom/.test(pos[0])) {
                pos = ['50%'].concat(pos);
            } else {
                pos.push('50%');
            }
        }

        return {
            element: $element,
            position: {
                // top|center|bottom => 0%|50%|100%
                x: pos[0] ? formatPosition(pos[0]) : 0,
                y: pos[1] ? formatPosition(pos[1]) : 0
            }
        };
    }

    /**
     * 获取尺寸及偏移值
     * @param elem
     * @returns {*}
     */
    function getDimensions(elem) {
        var raw = elem[0];
        var result;

        if ($.isWindow(raw) || raw._id === VIEWPORT._id) {
            var $win = $(window);
            result = {
                width: $win.width(),
                height: $win.height(),
                offset: {
                    top: $win.scrollTop(),
                    left: $win.scrollLeft()
                }
            };
        } else if (raw.preventDefault) {
            result = {
                width: 0,
                height: 0,
                offset: {
                    top: raw.pageY,
                    left: raw.pageX
                }
            };
        } else {
            switch (raw.nodeType) {
                case 1:
                    result = {
                        width: elem.outerWidth(),
                        height: elem.outerHeight(),
                        offset: getOffset(raw)
                    };
                    break;
                case 9:
                    result = {
                        width: elem.width(),
                        height: elem.height(),
                        offset: {
                            top: 0,
                            left: 0
                        }
                    };
                    break;
                default:
                    error('Invalid Element.');
                    break;
            }
        }

        return result;
    }

    /**
     * 偏移值计算
     * @param x
     * @param size
     * @returns {*}
     */
    function calculateOffset(x, size) {
        // 将百分比转为像素值
        if (/\d%/.test(x)) {
            x = x.replace(/([\d\.]+)%/g, function(m, n) {
                return size * (n / 100.0) || error('Arithmetic Errors.');
            });
        }

        // 处理类似 100%+20px 的情况
        if (/[+\-*\/]/.test(x)) {
            try {
                // eval 会影响压缩
                // new Function 方法效率高于 for 循环拆字符串的方法
                // 参照：http://jsperf.com/eval-newfunction-for
                x = (new Function('return ' + x))();
            } catch (e) {
                error('Invalid position value: ' + x);
            }
        }

        // 转回为数字
        return toNumber(x);
    }
});