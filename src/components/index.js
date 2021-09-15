import DatePicker from "./date-picker";
import {Select, Option, OptionGroup} from './select';
import Modal from "./modal";
import Slider from "./slider";
import Poptip from "./poptip";
import Button from "./button";
import PopConfirm from "./popconfirm";
import Message from "./message";
import Notice from "./notice";
import Tooltip from "./tooltip";
import Page from "./page";
import KlineLoading from "./kline-loading";
import GlobalLoading from "./global-loading";
import NoData from "./no-data";
import NoLogin from "./no-login";

const components = {
    DatePicker,
    Select,
    Option,
    OptionGroup,
    Modal,
    Slider,
    Poptip,
    Button,
    PopConfirm,
    Message,
    Notice,
    Tooltip,
    Page,
    KlineLoading,
    GlobalLoading,
    NoData,
    NoLogin
};

const install = (vue) => {
    Object.keys(components).forEach((key) => {
        vue.component(key, components[key]);
    });

    vue.prototype.$Message = Message;
    vue.prototype.$Notice = Notice;
}

export default {
    ...components,
    install
}
