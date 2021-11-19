import Vue from 'vue';
import _Popper from "popper.js";

const SPECIAL_CHARS_REGEXP = /([:\-_]+(.))/g;
const MOZ_HACK_REGEXP = /^moz([A-Z])/;

const trim = function(string) {
    return (string || '').replace(/^[\s\uFEFF]+|[\s\uFEFF]+$/g, '');
};

const camelCase = (name) => {
    return name.replace(SPECIAL_CHARS_REGEXP, function(_, separator, letter, offset) {
        return offset ? letter.toUpperCase() : letter;
    }).replace(MOZ_HACK_REGEXP, 'Moz$1');
}

export const isServer = Vue.prototype.$isServer;

// const Popper = isServer ? function() {} : require('popper.js/dist/umd/popper.js');
export const Popper = isServer ? function() {} : _Popper;

export const oneOf = (value, validatorList) => {
    for (let i = 0; i < validatorList.length; i++) {
        let item = validatorList[i];
        if (value === item) {
            return true;
        }
    }

    return false;
}

export const getStyle = (element, styleName) => {
    if (!element || !styleName) {
        return null;
    }

    styleName = camelCase(styleName);
    if (styleName === "float") {
        styleName = "cssFloat";
    }

    try {
        const computed = document.defaultView.getComputedStyle(element, '');
        return element.style[styleName] || computed ? computed[styleName] : null;
    } catch (e) {
        return element.style[styleName];
    }
}

export const findComponentUpward = (context, componentName, componentNames) => {
    if (typeof componentName === 'string') {
        componentNames = [componentName];
    } else {
        componentNames = componentName;
    }

    let parent = context.$parent;
    let name = parent.$options.name;
    while (parent && (!name || componentNames.indexOf(name) < 0)) {
        parent = parent.$parent;
        if (parent) name = parent.$options.name;
    }
    return parent;
}

export const hasClass = (el, cls) => {
    if(!el || !cls) {
        return false;
    }

    if(cls.indexOf(" ") !== -1) {
        throw new Error("className should not contain space.");
    }

    if(el.classList) {
        return el.classList.contains(cls);
    } else {
        return (' ' + el.className + ' ').indexOf(" " + cls + " ") > -1;
    }
}

export function addClass(el, cls) {
    if (!el) return;
    let curClass = el.className;
    const classes = (cls || '').split(' ');

    for (let i = 0, j = classes.length; i < j; i++) {
        const clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.add(clsName);
        } else {
            if (!hasClass(el, clsName)) {
                curClass += ' ' + clsName;
            }
        }
    }
    if (!el.classList) {
        el.className = curClass;
    }
}

export function removeClass(el, cls) {
    if (!el || !cls) return;
    const classes = cls.split(' ');
    let curClass = ' ' + el.className + ' ';

    for (let i = 0, j = classes.length; i < j; i++) {
        const clsName = classes[i];
        if (!clsName) continue;

        if (el.classList) {
            el.classList.remove(clsName);
        } else {
            if (hasClass(el, clsName)) {
                curClass = curClass.replace(' ' + clsName + ' ', ' ');
            }
        }
    }
    if (!el.classList) {
        el.className = trim(curClass);
    }
}


export const findComponentsDownward = (context, componentName, ignoreComponentNames  = []) => {
    if(!Array.isArray(ignoreComponentNames )) {
        ignoreComponentNames  = [ignoreComponentNames];
    }

    return context.$children.reduce((components, child) => {
        if(child.$options.name === componentName) {
            components.push(child);
        }

        if(ignoreComponentNames.indexOf(child.$options.name) < 0) {
            const foundChild = findComponentsDownward(child, componentName);
            return components.concat(foundChild)
        } else {
            return components
        }
    }, []);
}


let cached;
export const getScrollBarSize = (fresh) => {
    if(isServer) {
        return 0
    }

    if(fresh || cached === undefined) {
        const inner = document.createElement("div");
        inner.style.width = "100%";
        inner.style.height = "200px";

        const outer = document.createElement("div");
        const outerStyle = outer.style;

        outerStyle.position = 'absolute';
        outerStyle.top = 0;
        outerStyle.left = 0;
        outerStyle.pointerEvents = 'none';
        outerStyle.visibility = 'hidden';
        outerStyle.width = '200px';
        outerStyle.height = '150px';
        outerStyle.overflow = 'hidden';

        outer.appendChild(inner);

        document.body.appendChild(outer);

        const widthContained = inner.offsetWidth;
        outer.style.overflow = 'scroll';
        let widthScroll = inner.offsetWidth;

        if (widthContained === widthScroll) {
            widthScroll = outer.clientWidth;
        }

        document.body.removeChild(outer);

        cached = widthContained - widthScroll;

    }

    return cached;
}


function typeOf(obj) {
    const toString = Object.prototype.toString;
    const map = {
        '[object Boolean]'  : 'boolean',
        '[object Number]'   : 'number',
        '[object String]'   : 'string',
        '[object Function]' : 'function',
        '[object Array]'    : 'array',
        '[object Date]'     : 'date',
        '[object RegExp]'   : 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]'     : 'null',
        '[object Object]'   : 'object'
    };
    return map[toString.call(obj)];
}


export function deepCopy(data) {
    const t = typeOf(data);
    let o;

    if (t === 'array') {
        o = [];
    } else if ( t === 'object') {
        o = {};
    } else {
        return data;
    }

    if (t === 'array') {
        for (let i = 0; i < data.length; i++) {
            o.push(deepCopy(data[i]));
        }
    } else if ( t === 'object') {
        for (let i in data) {
            o[i] = deepCopy(data[i]);
        }
    }
    return o;
}

export function scrollTop(el, from = 0, to, duration = 500, endCallback) {
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = (
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                return window.setTimeout(callback, 1000/60);
            }
        );
    }
    const difference = Math.abs(from - to);
    const step = Math.ceil(difference / duration * 50);

    function scroll(start, end, step) {
        if (start === end) {
            endCallback && endCallback();
            return;
        }

        let d = (start + step > end) ? end : start + step;
        if (start > end) {
            d = (start - step < end) ? end : start - step;
        }

        if (el === window) {
            window.scrollTo(d, d);
        } else {
            el.scrollTop = d;
        }
        window.requestAnimationFrame(() => scroll(d, end, step));
    }
    scroll(from, to, step);
}

export function firstUpperCase(str) {
    return str.toString()[0].toUpperCase() + str.toString().slice(1);
}