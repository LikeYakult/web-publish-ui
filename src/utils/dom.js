import Vue from "vue";
const isServer = Vue.prototype.$isServer;

export const on = (element, event, handler) => {
    if(!isServer && document.addEventListener) {
        return element.addEventListener(event, handler, false);
    } else {
        return element.attachEvent("on" + event, handler);
    }
};


export const off = (element, event, handler) => {
    if(!isServer && document.removeEventListener) {
        return element.removeEventListener(event, handler, false);
    } else {
        return element.detachEvent("on" + event, handler);
    }
};


export const doc = dom => document.querySelector(dom);
export const docALL = dom => document.querySelectorAll(dom);
export const docBody = document.body;
export const docEle = document.documentElement;
