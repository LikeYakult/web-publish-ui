<template>
    <div v-transfer-dom :data-transfer="transfer">
        <transition :name="transitionNames[1]">
            <div :class="maskClasses" :style="wrapStyles" v-show="visible" v-if="showMask" @click="handleMask"></div>
        </transition>
        <div :class="wrapClasses" :style="wrapStyles" @click="handleWrapClick">
            <transition :name="transitionNames[0]" @after-leave="animationFinish">
                <div :class="classes" :style="mainStyles" v-show="visible" @mousedown="handleMousedown">
                    <div :class="contentClasses" ref="content" :style="contentStyles" @click="handleClickModal">
                        <a :class="[prefixCls + '-close']" v-if="closable" @click="close">
                            <slot name="close">
                                <i class="icon iconfont icon-icon_delete1" />
                            </slot>
                        </a>
                        <div :class="[prefixCls + '-header']"
                             @mousedown="handleMoveStart"
                             v-if="showHead"
                        >
                            <slot name="header">
                                <div :class="[prefixCls + '-header-inner']">
                                    {{ title }}
                                </div>
                            </slot>
                        </div>
                        <div :class="[prefixCls + '-body']">
                            <slot></slot>
                        </div>
                        <div :class="[prefixCls + '-footer']" v-if="!footerHide">
                            <slot name="footer">
                                <button :class="[prefixCls + '-btn', 'cancel']" v-if="showCancelBtn"  @click="cancel">{{ localeCancelText }}</button>
                                <button :class="[prefixCls + '-btn', 'ok']" :loading="buttonLoading" @click="ok">{{ localeOkText }}</button>
                            </slot>
                        </div>
                    </div>
                </div>
            </transition>
        </div>
    </div>
</template>
<script>
import TransferDom from '../../directives/transfer-dom';
import Emitter from '../emitter';
import ScrollbarMixins from './mixins-scrollbar';

import { on, off } from '../../utils/dom';
import { findComponentsDownward } from '../utils/assist';

import { transferIndex as modalIndex, transferIncrease as modalIncrease } from '../utils/transfer-queue';

const prefixCls = 'trade-modal';

export default {
    name: 'Modal',
    mixins: [ Emitter, ScrollbarMixins ],
    directives: { TransferDom },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: true
        },
        maskClosable: {
            type: Boolean,
            default () {
                return true;
            }
        },
        title: {
            type: String
        },
        width: {
            type: [Number, String],
            default: 640
        },
        okText: {
            type: String
        },
        cancelText: {
            type: String
        },
        loading: {
            type: Boolean,
            default: false
        },
        styles: {
            type: Object,
            default() {
                return {};
            }
        },
        className: {
            type: String
        },
        footerHide: {
            type: Boolean,
            default: false
        },
        scrollable: {
            type: Boolean,
            default: false
        },
        transitionNames: {
            type: Array,
            default () {
                // return ['ease', 'fade'];
                return ['ease', ''];
            }
        },
        transfer: {
            type: Boolean,
            default () {
                return true
            }
        },
        fullscreen: {
            type: Boolean,
            default: false
        },
        mask: {
            type: Boolean,
            default: true
        },
        draggable: {
            type: Boolean,
            default: false
        },
        zIndex: {
            type: Number,
            default: 1000
        },
        showCancelBtn: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            prefixCls: prefixCls,
            wrapShow: false,
            showHead: true,
            buttonLoading: false,
            visible: this.value,
            dragData: {
                x: null,
                y: null,
                dragX: null,
                dragY: null,
                dragging: false
            },
            top: 0,
            left: 0,
            modalIndex: this.handleGetModalIndex(),
            isMouseTriggerIn: false,
        };
    },
    computed: {
        wrapClasses () {
            return [
                `${prefixCls}-wrap`,
                {
                    [`${prefixCls}-hidden`]: !this.wrapShow,
                    [`${this.className}`]: !!this.className,
                    [`${prefixCls}-no-mask`]: !this.showMask
                }
            ];
        },
        wrapStyles () {
            return {
                zIndex: this.modalIndex + this.zIndex
            };
        },
        maskClasses () {
            return `${prefixCls}-mask`;
        },
        classes () {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-fullscreen`]: this.fullscreen,
                    [`${prefixCls}-fullscreen-no-header`]: this.fullscreen && !this.showHead,
                    [`${prefixCls}-fullscreen-no-footer`]: this.fullscreen && this.footerHide
                }
            ];
        },
        contentClasses () {
            return [
                `${prefixCls}-content`,
                {
                    [`${prefixCls}-content-no-mask`]: !this.showMask,
                    [`${prefixCls}-content-drag`]: this.draggable,
                    [`${prefixCls}-content-dragging`]: this.draggable && this.dragData.dragging
                }
            ];
        },
        mainStyles () {
            let style = {};

            const width = parseInt(this.width);
            const styleWidth = this.dragData.x !== null ? {
                top: 0
            } : {
                width: width <= 100 ? `${width}%` : `${width}px`
            };

            const customStyle = this.styles ? this.styles : {};

            Object.assign(style, styleWidth, customStyle);

            return style;
        },
        contentStyles () {
            let style = {};

            if (this.draggable) {
                let customTop = this.styles.top ? parseFloat(this.styles.top) : 0;
                let customLeft = this.styles.left ? parseFloat(this.styles.left) : 0;
                if (this.dragData.x !== null) style.left = `${this.dragData.x - customLeft}px`;
                if (this.dragData.y !== null) style.top = `${this.dragData.y - customTop}px`;
                const width = parseInt(this.width);
                const styleWidth = {
                    width: width <= 100 ? `${width}%` : `${width}px`
                };

                Object.assign(style, styleWidth);
            }

            return style;
        },
        localeOkText () {
            if (this.okText === undefined) {
                return this.$t("app.ok");
            } else {
                return this.okText;
            }
        },
        localeCancelText () {
            if (this.cancelText === undefined) {
                return this.$t("app.cancel");
            } else {
                return this.cancelText;
            }
        },
        showMask () {
            return this.draggable ? false : this.mask;
        }
    },
    methods: {
        close () {
            this.visible = false;
            this.$emit('input', false);
            this.$emit('cancel');
        },
        handleMask () {
            if (this.maskClosable && this.showMask) {
                this.close();
            }
        },
        handleWrapClick (event) {
            if (this.isMouseTriggerIn) {
                this.isMouseTriggerIn = false;
                return;
            }

            const className = event.target.getAttribute('class');
            if (className && className.indexOf(`${prefixCls}-wrap`) > -1) this.handleMask();
        },
        handleMousedown () {
            this.isMouseTriggerIn = true;
        },
        cancel () {
            this.close();
        },
        ok () {
            if (this.loading) {
                this.buttonLoading = true;
            }
            // else {
            //     this.visible = false;
            //     this.$emit('input', false);
            // }
            this.$emit('ok');
        },
        EscClose (e) {
            if (this.visible && this.closable) {
                if (e.keyCode === 27) {
                    const $Modals = findComponentsDownward(this.$root, 'Modal').filter(item => item.$data.visible && item.$props.closable);

                    const $TopModal = $Modals.sort((a, b) => {
                        return a.$data.modalIndex < b.$data.modalIndex ? 1 : -1;
                    })[0];

                    setTimeout(() => {
                        $TopModal.close();
                    }, 0);
                }
            }
        },
        animationFinish() {
            this.$emit('hidden');
        },
        handleMoveStart (event) {
            if (!this.draggable) return false;

            const $content = this.$refs.content;
            const rect = $content.getBoundingClientRect();
            this.dragData.x = rect.x || rect.left;
            this.dragData.y = rect.y || rect.top;

            const distance = {
                x: event.clientX,
                y: event.clientY
            };

            this.dragData.dragX = distance.x;
            this.dragData.dragY = distance.y;

            this.dragData.dragging = true;

            on(window, 'mousemove', this.handleMoveMove);
            on(window, 'mouseup', this.handleMoveEnd);
        },
        handleMoveMove (event) {
            if (!this.dragData.dragging) return false;

            const distance = {
                x: event.clientX,
                y: event.clientY
            };

            const diff_distance = {
                x: distance.x - this.dragData.dragX,
                y: distance.y - this.dragData.dragY
            };

            this.dragData.x += diff_distance.x;
            this.dragData.y += diff_distance.y;

            this.dragData.dragX = distance.x;
            this.dragData.dragY = distance.y;
        },
        handleMoveEnd () {
            this.dragData.dragging = false;
            off(window, 'mousemove', this.handleMoveMove);
            off(window, 'mouseup', this.handleMoveEnd);
        },
        handleGetModalIndex () {
            modalIncrease();
            return modalIndex;
        },
        handleClickModal () {
            if (this.draggable) {
                this.modalIndex = this.handleGetModalIndex();
            }
        }
    },
    mounted () {
        if (this.visible) {
            this.wrapShow = true;
        }

        let showHead = true;

        if (this.$slots.header === undefined && !this.title) {
            showHead = false;
        }

        this.showHead = showHead;

        document.addEventListener('keydown', this.EscClose);
    },
    beforeDestroy () {
        document.removeEventListener('keydown', this.EscClose);
        this.removeScrollEffect();
    },
    watch: {
        value (val) {
            this.visible = val;
        },
        visible (val) {
            if (val === false) {
                this.buttonLoading = false;
                this.timer = setTimeout(() => {
                    this.wrapShow = false;
                    this.removeScrollEffect();
                }, 300);
            } else {
                this.modalIndex = this.handleGetModalIndex();

                if (this.timer) clearTimeout(this.timer);
                this.wrapShow = true;
                if (!this.scrollable) {
                    this.addScrollEffect();
                }
            }
            this.broadcast('Table', 'on-visible-change', val);
            this.broadcast('Slider', 'on-visible-change', val);  // #2852
            this.$emit('on-visible-change', val);
        },
        loading (val) {
            if (!val) {
                this.buttonLoading = false;
            }
        },
        scrollable (val) {
            if (!val) {
                this.addScrollEffect();
            } else {
                this.removeScrollEffect();
            }
        },
        title (val) {
            if (this.$slots.header === undefined) {
                this.showHead = !!val;
            }
        }
    }
};
</script>