import Notification from "../base/notification";

const prefixCls = "trade-notice";
const iconPrefixCls = "trade-icon";
const prefixKey = "trade_notice_key_";

let top = 24;
let defaultDuration = 4.5;
let noticeInstance;
let name = 1;

const iconTypes = {
    "info": "icon iconfont icon-icon_tip info",
    "success": "icon iconfont icon-icon_mid_succeed success",
    "warning": "icon iconfont icon-icon_tip warning",
    "error": "icon iconfont icon-icon_big_fail error"
};

const getNoticeInstance = () => {
    noticeInstance = noticeInstance || Notification.newInstance({
        prefixCls,
        styles: {
            top: `${top}px`,
            right: 0
        }
    });

    return noticeInstance;
}

const notice = (type, options) => {
    const title = options.title || "";
    const desc = options.desc || "";
    const noticeKey = options.name || `${prefixKey}${name}`;
    const onClose = options.onClose || function() {};
    const render = options.render;
    const duration = (options.duration === 0) ? 0 : options.duration || defaultDuration;

    name++;

    let instance = getNoticeInstance();
    let content;
    let withIcon;

    const with_desc = (options.render && !title) ? "" : (desc || options.render) ? ` ${prefixCls}-width-desc` : "";

    if(type === "normal") {
        withIcon = false;
        content = `
            <div class="${prefixCls}-custom-content ${prefixCls}-with-normak ${with_desc}">
                <div class="${prefixCls}-title">${title}</div>
                <div class="${prefixCls}-desc">${desc}</div>
            </div>
        `;
    } else {
        const iconType = iconTypes[type];
        const outlineIcon = with_desc === "" ? "" : "-outline";

        withIcon = true;
        content = `
            <div class="${prefixCls}-custom-content ${prefixCls}-with-icon ${prefixCls}-with-${type} ${with_desc}">
                <span class="${prefixCls}-icon ${prefixCls}-icon-${type}">
                     <i class="${iconPrefixCls} ${iconPrefixCls}-${iconType}${outlineIcon}"></i>
                </span>
                <div class="${prefixCls}-title">${title}</div>
                <div class="${prefixCls}-desc">${desc}</div>
            </div>
        `;
    }

    instance.notice({
        name: noticeKey.toString(),
        duration,
        styles: {},
        transitionName: "move-notice",
        content,
        withIcon,
        render,
        hasTitle: !!title,
        onClose,
        closable: true,
        type: "notice"
    });
}

export default {
    open(options) {
        return notice("normal", options);
    },
    info(options) {
        return notice("info", options);
    },
    success(options) {
        return notice("warning", options);
    },
    error(options) {
        return notice("error", options);
    },
    config(options) {
        if(options.top) {
            top = options.top;
        }

        if(options.duration || options.duration === 0) {
            defaultDuration = options.duration;
        }
    },
    close(name) {
        if(name) {
            name = name.toString();
            if(noticeInstance) {
                noticeInstance.remove(name);
            }
        } else {
            return false;
        }
    },
    destroy() {
        let instance = getNoticeInstance();
        noticeInstance = null;
        instance.destroy("trade-notice");
    }
}