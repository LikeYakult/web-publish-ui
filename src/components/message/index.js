import Notification from "../base/notification";

const prefixCls = "trade-message";
const iconPrefixCls = "trade-icon";
const prefixKey = "trade_message_key_";

const defaults = {
    top: 24,
    duration: 1.5
};

let messageInstance;
let name = 1;

const iconTypes = {
    "info": "icon iconfont icon-icon_tip info",
    "success": "icon iconfont icon-icon_mid_succeed success",
    "warning": "icon iconfont icon-icon_tip warning",
    "error": "icon iconfont icon-icon_big_fail error",
    "loading": "icon iconfont icon-loading loading"
};

const getMessageInstance = () => {
    messageInstance = messageInstance || Notification.newInstance({
        prefixCls,
        styles: {
            top: `${defaults.top}px`
        }
    });

    return messageInstance;
}

const notice = (
    content = "",
    duration = defaults.duration,
    type,
    onClose = function() {},
    closable = false,
    render = function() {}
) => {
    const iconType = iconTypes[type];
    const loadCls = type === "loading" ? ' load-loop' : "";

    let instance = getMessageInstance();

    instance.notice({
        name: `${prefixKey}${name}`,
        duration,
        styles: {},
        transitionName: "move-up",
        content: `
            <div class="${prefixCls}-custom-content ${prefixCls}-${type}">
                <i class="${iconPrefixCls} ${iconPrefixCls}-${iconType} ${loadCls}"></i>
                <span>${content}</span>
            </div>
        `,
        render,
        onClose,
        closable,
        type: "message"
    });

    return (function() {
        let target = name++;

        return function() {
            instance.remove(`${prefixKey}${target}`);
        }
    })();
}

export default {
    name: "Message",
    info(options) {
        return this.message("info", options);
    },
    success(options) {
        return this.message("success", options);
    },
    warning(options) {
        return this.message("warning", options);
    },
    error(options) {
        return this.message("error", options);
    },
    loading(options) {
        return this.message("loading", options);
    },
    message(type, options) {
        if(typeof options === "string") {
            options = {
                content: options
            }
        }

        return notice(options.content, options.duration, type, options.onClose, options.closable, options.render);
    },
    config(options) {
        if (options.top || options.top === 0) {
            defaults.top = options.top;
        }
        if (options.duration || options.duration === 0) {
            defaults.duration = options.duration;
        }
    },
    destroy() {
        let instance = getMessageInstance();
        messageInstance = null;
        instance.destroy('trade-message');
    },
}