<template>
    <div @click="onHeaderClick" :class="headCls">
        <span :class="[prefixCls + '-prefix']" v-if="$slots.prefix || prefix">
            <slot name="prefix">
<!--                <i :type="prefix" v-if="prefix"/>-->
            </slot>
        </span>
        <template v-for="(item, index) in selectedMultiple">
            <div :key="index" class="trade-tag trade-tag-checked" v-if="maxTagCount === undefined || index < maxTagCount">
                <span class="trade-tag-text">{{ item.label }}</span>
                <!--            <i type="ios-close" @click.native.stop="removeTag(item)"></Icon>-->
            </div>
        </template>
        <div class="trade-tag trade-tag-checked" v-if="maxTagCount !== undefined && selectedMultiple.length > maxTagCount">
            <span class="trade-tag-text trade-select-max-tag">
                <template v-if="maxTagPlaceholder">{{maxTagPlaceholder(selectedMultiple.length - maxTagCount)}}</template>
                <template v-else>+ {{ selectedMultiple.length - maxTagCount }}...</template>
            </span>
        </div>
        <span
            :class="singleDisplayClasses"
            v-show="singleDisplayValue"
        >{{ singleDisplayValue }}</span>
        <input
            :id="inputElementId"
            type="text"
            v-if="filterable"
            v-model="query"
            :disabled="disabled"
            :class="[prefixCls + '-input']"
            :placeholder="showPlaceholder ? localePlaceholder : ''"
            :style="inputStyle"
            autocomplete="off"
            spellcheck="false"
            @keydown="resetInputState"
            @keydown.delete="handleInputDelete"
            @keydown.enter="handleInputEnter"
            @focus="onInputFocus"
            @blur="onInputBlur"
            ref="input">
        <i class="icon iconfont icon-icon_big_fail delete" :class="[prefixCls + '-arrow']" v-if="resetSelect" @click.stop="onClear"/>
        <i class="icon iconfont icon-arrow-down-bold arrow" :class="[prefixCls + '-arrow']" v-if="!resetSelect && !remote"></i>
    </div>
</template>
<script>
import Emitter from '../emitter';

const prefixCls = 'trade-select';

export default {
    name: 'SelectHead',
    mixins: [Emitter],
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        filterable: {
            type: Boolean,
            default: false
        },
        multiple: {
            type: Boolean,
            default: false
        },
        remote: {
            type: Boolean,
            default: false
        },
        initialLabel: {
            type: [String, Number, Array],
        },
        values: {
            type: Array,
            default: () => []
        },
        clearable: {
            type: [Function, Boolean],
            default: false,
        },
        inputElementId: {
            type: String
        },
        placeholder: {
            type: String
        },
        queryProp: {
            type: String,
            default: ''
        },
        prefix: {
            type: String
        },
        maxTagCount: {
            type: Number
        },
        maxTagPlaceholder: {
            type: Function
        }
    },
    data() {
        return {
            prefixCls: prefixCls,
            query: '',
            inputLength: 20,
            remoteInitialLabel: this.initialLabel,
            preventRemoteCall: false,
        };
    },
    computed: {
        singleDisplayClasses() {
            const {filterable, multiple, showPlaceholder} = this;
            return [{
                [prefixCls + '-head-with-prefix']: this.$slots.prefix || this.prefix,
                [prefixCls + '-placeholder']: showPlaceholder && !filterable,
                [prefixCls + '-selected-value']: !showPlaceholder && !multiple && !filterable,
            }];
        },
        singleDisplayValue() {
            if ((this.multiple && this.values.length > 0) || this.filterable) return '';
            return `${this.selectedSingle}` || this.localePlaceholder;
        },
        showPlaceholder() {
            let status = false;
            if (!this.multiple) {
                const value = this.values[0];
                if (typeof value === 'undefined' || String(value).trim() === '') {
                    status = !this.remoteInitialLabel;
                }
            } else {
                if (!this.values.length > 0) {
                    status = true;
                }
            }
            return status;
        },
        resetSelect() {
            return !this.showPlaceholder && this.clearable;
        },
        inputStyle() {
            let style = {};

            if (this.multiple) {
                if (this.showPlaceholder) {
                    style.width = '100%';
                } else {
                    style.width = `${this.inputLength}px`;
                }
            }

            return style;
        },
        localePlaceholder() {
            if (this.placeholder === undefined) {
                return this.$t('app.p-select');
            } else {
                return this.placeholder;
            }
        },
        selectedSingle() {
            const selected = this.values[0];
            return selected ? selected.label : (this.remoteInitialLabel || '');
        },
        selectedMultiple() {
            return this.multiple ? this.values : [];
        },
        headCls() {
            return {
                [`${prefixCls}-head-flex`]: this.filterable && (this.$slots.prefix || this.prefix)
            };
        }
    },
    methods: {
        handleInputEnter() {
            this.$emit("on-input-enter", this.query);
        },
        onInputFocus() {
            this.$emit('on-input-focus');
        },
        onInputBlur() {
            if (!this.values.length) this.query = '';
            this.$emit('on-input-blur');
        },
        removeTag(value) {
            if (this.disabled) return false;
            this.dispatch('iSelect', 'on-select-selected', value);
        },
        resetInputState() {
            this.inputLength = this.$refs.input.value.length * 12 + 20;
            this.$emit('on-keydown');
        },
        handleInputDelete(e) {
            const targetValue = e.target.value;
            if (this.multiple && this.selectedMultiple.length && this.query === '' && targetValue === '') {
                this.removeTag(this.selectedMultiple[this.selectedMultiple.length - 1]);
            }
        },
        onHeaderClick(e) {
            if (this.filterable && e.target === this.$el) {
                this.$refs.input.focus();
            }
        },
        onClear() {
            this.$emit('on-clear');
        }
    },
    watch: {
        values([value]) {
            if (!this.filterable) return;
            this.preventRemoteCall = true;
            if (this.multiple) {
                this.query = '';
                this.preventRemoteCall = false;
                return;
            }
            if (typeof value === 'undefined' || value === '' || value === null) this.query = '';
            else this.query = value.label.trim();
            this.$nextTick(() => this.preventRemoteCall = false);
        },
        query(val) {
            if (this.preventRemoteCall) {
                this.preventRemoteCall = false;
                return;
            }

            this.$emit('on-query-change', val);
        },
        queryProp(query) {
            if (query !== this.query) this.query = query.trim();
        },
    }
};
</script>