<template>
    <label :class="wrapClasses">
        <span :class="radioClasses">
            <span :class="innerClasses"></span>
            <input type="radio"
                   :class="inputClasses"
                   :disabled="disabled"
                   :checked="currentValue"
                   :name="groupName"
                   @change="change"
                   @focus="onFocus"
                   @blur="onBlur"
            />
            <span class="trade-radio-text"><slot>{{ label }}</slot></span>
        </span>
    </label>
</template>

<script>
import { oneOf, findComponentUpward } from "../utils/assist";
import Emitter from "../emitter";
const prefixCls = "trade-radio";

export default {
    name: "Radio",
    mixins: [ Emitter ],
    props: {
        value: {
            type: [String, Number, Boolean],
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        trueValue: {
            type: [String, Number, Boolean],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean],
            default: false
        },
        label: {
            type: [String, Number, Boolean]
        },
        size: {
            validator(value) {
                return oneOf(value, ['small', 'large', 'default'])
            },
            default() {
                return "default"
            }
        },
        name: {
            type: String
        }
    },
    data() {
        return {
            group: false,
            currentValue: this.value,
            focusWrapper: false,
            focusInner: false,
            groupName: this.name,
            parent: findComponentUpward(this, "RadioGroup")
        }
    },
    computed: {
        wrapClasses() {
            return [
                `${prefixCls}-wrapper`,
                {
                    [`${prefixCls}-group-item`]: this.group,
                    [`${prefixCls}-wrapper-checked`]: this.currentValue,
                    [`${prefixCls}-wrapper-disabled`]: this.disabled,
                    [`${prefixCls}-${this.size}`]: !!this.size,
                    [`${prefixCls}-focus`]: this.focusWrapper
                }
            ]
        },
        radioClasses() {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-checked`]: this.currentValue,
                    [`${prefixCls}-disabled`]: this.disabled,
                }
            ]
        },
        innerClasses() {
            return [
                `${prefixCls}-inner`,
                {
                    [`${prefixCls}-focus`]: this.focusInner
                }
            ]
        },
        inputClasses() {
            return `${prefixCls}-input`;
        }
    },
    watch: {
        value(val) {
            if(val === this.trueValue || val === this.falseValue) {
                this.updateValue();
            } else {
                throw "Value should be trueValue of falseValue"
            }
        }
    },
    mounted() {
        if(this.parent) {
            this.group = true;
            if(this.name && this.name !== this.parent.name) {
                if(console.warn) {
                    console.warn("Name does not match Radio Group name.")
                }
            } else {
                this.groupName = this.parent.name;
            }
        }

        if(this.group) {
            this.parent.updateValue();
        } else {
            this.updateValue();
        }
    },
    methods: {
        change(event) {
            if(this.disabled) {
                return false
            }

            const checked = event.target.checked;
            this.currentValue = checked;

            const value = checked ? this.trueValue : this.falseValue;
            this.$emit("input", value);

            if(this.group) {
                if(this.label !== undefined) {
                    this.parent.change({
                        value: this.label,
                        checked: this.value
                    })
                }
            } else {
                this.$emit("on-change", value);
                this.dispatch("FormItem", "on-form-change", value);
            }
        },
        onFocus() {
            if(this.group && this.parent.type === "button") {
                this.focusWrapper = true
            } else {
                this.focusInner = true;
            }
        },
        onBlur() {
            this.focusInner = false;
            this.focusWrapper = false;
        },
        updateValue() {
          this.currentValue = this.value === this.trueValue;
        }
    }
}
</script>