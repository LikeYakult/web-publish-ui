import DatePicker from "./date-picker";
import {Select, Option, OptionGroup} from './select';
import Modal from "./modal";
import Slider from "./slider";
import Checkbox from "./checkbox";
import Poptip from "./poptip";
import Radio from "./radio";
import Button from "./button";
import PopConfirm from "./popconfirm";
import Message from "./message";
import Notice from "./notice";
import Tooltip from "./tooltip";
import Page from "./page";
import KlineLoading from "./kline-loading";
import GlobalLoading from "./global-loading";

const components = {
    Radio,
    RadioGroup: Radio.Group,
    Checkbox,
    CheckboxGroup: Checkbox.Group,
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
    GlobalLoading
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
