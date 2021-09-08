<template>
    <div :class="classes"
         @mouseenter="handleMouseenter"
         @mouseleave="handleMouseleave"
         v-click-outside="handleClose"
    >
        <div :class="[prefix + '-rel']"
             ref="reference"
             @click="handleClick"
             @mousedown="handleFocus(false)"
             @mouseup="handleBlur(false)"
        >
            <slot></slot>
        </div>
        <transition name="fade">
            <div :class="popperClasses"
                 :style="styles"
                 ref="popper"
                 v-show="visible"
                 @click="handleTransferClick"
                 @mouseenter="handleMouseenter"
                 @mouseleave="handleMouseleave"
                 :data-transfer="transfer"
                 v-transfer-dom
            >
                <div :class="[prefix + '-content']">
                    <div :class="[prefix + '-arrow']" v-if="!disabledArrow"></div>
                    <div :class="[prefix + '-inner']" v-if="confirm">
                        <div :class="[prefix + '-body', { ['no-padding']: this.transfer }]">
                            <i class="icon icon-confirm"></i>
                            <div :class="[prefix + '-body-message']">
                                <slot name="title">{{ title }}</slot>
                            </div>
                        </div>
                        <div :class="[prefix + '-footer']">
                            <a-button type="link" size="small" @click.native="handleCancel">{{ $t("app.cancel") }}</a-button>
                            <a-button type="primary" size="small" @click.native="handleOk">{{ $t("app.ok") }}</a-button>
                        </div>
                    </div>
                    <div :class="[prefix + '-inner']" v-if="!confirm">
                        <div :class="[prefix + '-title']"
                             :style="contentPaddingStyle"
                             v-if="showTitle"
                             ref="title"
                        >
                            <slot name="title" v-if="title">
                                <div :class="[prefix + '-title-inner']">
                                    {{ title }}
                                </div>
                            </slot>
                        </div>
                        <div :class="[prefix + '-body', { ['no-padding']: this.transfer }]" :style="contentPaddingStyle">
                            <div :class="contentClasses">
                                <slot name="content">
                                    <div :class="[prefix + '-body-content-inner']">
                                        {{ content }}
                                    </div>
                                </slot>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script>
import Popper from "../utils/popper";
import { oneOf } from "../utils/assist";
import { directive as clickOutside } from 'v-click-outside-x';
import { transferIndex, transferIncrease } from '../utils/transfer-queue';
import TransferDom from "@/directives/transfer-dom";

const prefix = "trade-poptip";
export default {
    name: 'poptip',
    mixins: [ Popper ],
    directives: { clickOutside, TransferDom },
    props: {
        trigger: {
            validator(value) {
                return oneOf(value, ["click", "focus", "hover"])
            },
            default: "click"
        },
        placement: {
            validator (value) {
                return oneOf(value, ['top', 'top-start', 'top-end', 'bottom', 'bottom-start', 'bottom-end', 'left', 'left-start', 'left-end', 'right', 'right-start', 'right-end']);
            },
            default: 'top'
        },
        confirm: {
            type: Boolean,
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        transfer: {
            type: Boolean
        },
        popperClass: {
            type: String
        },
        width: {
            type: [String, Number]
        },
        title: {
            type: [String, Number, Boolean]
        },
        wordWrap: {
            type: Boolean,
            default: false
        },
        content: {
            type: [String, Number],
            default: ""
        },
        padding: {
            type: String
        },
        disabledArrow: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            prefix,
            isInput: false,
            visible: false,
            showTitle: true,
            enterTimer: null,
            tIndex: this.handleGetIndex(),
            disableCloseUnderTransfer: false
        }
    },
    computed: {
        classes() {
            return [
                `${prefix}`,
                {
                    [`${prefix}-confirm`]: this.confirm
                }
            ]
        },
        popperClasses () {
            return [
                `${prefix}-popper`,
                {
                    [`${prefix}-confirm`]: this.transfer && this.confirm,
                    [`${this.popperClass}`]: !!this.popperClass
                }
            ]
        },
        styles () {
            let style = {};

            if (this.width) {
                style.width = `${this.width}px`;
            }

            if(this.transfer) {
                style["z-index"] = 1060 + this.tIndex;
            }

            return style;
        },
        contentPaddingStyle() {
            const styles = {};
            if (this.padding !== "") {
                styles['padding'] = this.padding;
            }

            return styles;
        },
        contentClasses () {
            return [
                `${prefix}-body-content`,
                {
                    [`${prefix}-body-content-word-wrap`]: this.wordWrap
                }
            ]
        }
    },
    mounted() {
        if (!this.confirm) {
            this.showTitle = (this.$slots.title !== undefined) || this.title;
        }

        if (this.trigger === "focus") {
            this.$nextTick(() => {
                const $children = this.getInputChildren();
                if($children) {
                    this.isInput = true;
                    $children.addEventListener("focus", this.handleFocus, false);
                    $children.addEventListener("blur", this.handleBlur, false);
                }
            })
        }
    },
    beforeDestroy() {
        const $children = this.getInputChildren();
        if ($children) {
            $children.removeEventListener('focus', this.handleFocus, false);
            $children.removeEventListener('blur', this.handleBlur, false);
        }
    },
    methods: {
        handleClick () {
            if (this.disabled) {
                return;
            }

            if (this.confirm) {
                this.visible = !this.visible;
                return true;
            }

            if (this.trigger !== "click") {
                return false;
            }

            this.visible = !this.visible;
        },
        handleCancel () {
            this.visible = false;
            this.$emit("on-cancel");
        },
        handleOk() {
            this.visible = false;
            this.$emit("ok");
        },
        handleTransferClick() {
            if (this.transfer) {
                this.disableCloseUnderTransfer = true;
            }
        },
        handleClose () {
            if (this.disableCloseUnderTransfer) {
                this.disableCloseUnderTransfer = false;
                return false;
            }

            if (this.confirm) {
                this.visible = false;
                return true;
            }

            if (this.trigger !== "click") {
                return false;
            }

            this.visible = false;
        },
        handleFocus (formInput = true) {
            if (this.disabled) {
                return;
            }

            if (this.trigger !== "focus" || this.confirm || (this.isInput && !formInput)) {
                return false;
            }

            this.visible = true;
        },
        handleBlur (formInput = false) {
            if (this.trigger !== "focus" || this.confirm || (this.isInput && !formInput)) {
                return false;
            }
            this.visible = false;
        },
        handleMouseenter () {
            if (this.disabled) {
                return;
            }

            if (this.trigger !== "hover" || this.confirm) {
                return false;
            }

            if (this.enterTimer) {
                clearTimeout(this.enterTimer);
            }

            this.enterTimer = setTimeout(() => {
                this.visible = true;
            }, 100)
        },
        handleMouseleave () {
            if (this.trigger !== "hover" || this.confirm) {
                return false;
            }

            if (this.enterTimer) {
                clearTimeout(this.enterTimer);

                this.enterTimer = setTimeout(() => {
                    this.visible = false;
                }, 100)
            }
        },
        handleGetIndex () {
            transferIncrease();
            return transferIndex;
        },
        getInputChildren() {
            const $input = this.$refs.reference.querySelectorAll("input");
            const $textarea = this.$refs.reference.querySelectorAll("textarea");

            let $children = null;

            if ($input.length) {
                $children = $input[0];
            } else if ($textarea.length) {
                $children = $textarea[0];
            }
            return $children;
        }
    }
}
</script>