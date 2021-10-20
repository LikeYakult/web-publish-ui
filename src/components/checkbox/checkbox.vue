<template>
    <label :class="wrapClasses">
        <span :class="checkboxClasses">
            <span :class="innerClasses"></span>
            <input type="checkbox"
                   v-if="group"
                   :class="inputClasses"
                   :disabled="disabled"
                   :value="label"
                   v-model="model"
                   :name="name"
                   @change="change"
                   @focus="onFocus"
                   @blur="onBlur"
            />
            <input type="checkbox"
                   v-else
                   :class="inputClasses"
                   :disabled="disabled"
                   :checked="currentValue"
                   :name="name"
                   @change="change"
                   @focus="onFocus"
                   @blur="onBlur"
            >
        </span>
        <slot>
            <span v-if="showSlot">{{ label }}</span>
        </slot>
    </label>
</template>

<script>
import { oneOf, findComponentUpward } from "../utils/assist";
import Emitter from "../emitter";

const prefixCls = "trade-checkbox";
export default {
    name: "Checkbox",
    mixins: [ Emitter ],
    props: {
        name: {
            type: String
        },
        value: {
            type: [String, Number, Boolean],
            default: false
        },
        disabled: {
            type: Boolean,
            default: false
        },
        indeterminate: {
            type: Boolean,
            default: false
        },
        label: [String, Number, Boolean],
        size: {
            validator(value) {
                return oneOf(value, ["small", "large", "default"]);
            },
            default() {
                return "default"
            }
        },
        trueValue: {
            type: [String, Number, Boolean],
            default: true
        },
        falseValue: {
            type: [String, Number, Boolean],
            default: false
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
                    [`${prefixCls}-${this.size}`]: !!this.size
                }
            ]
        },
        checkboxClasses() {
            return [
                `${prefixCls}`,
                {
                    [`${prefixCls}-checked`]: this.currentValue,
                    [`${prefixCls}-disabled`]: this.disabled,
                    [`${prefixCls}-indeterminate`]: this.indeterminate
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
            return `${prefixCls}-input`
        }
    },
    data () {
        return {
            model: [],
            currentValue: this.value,
            group: false,
            focusInner: false,
            showSlot: false,
            parent: findComponentUpward(this, "checkboxGroup")
        }
    },
    watch: {
        value(val) {
            if(val === this.trueValue || val === this.falseValue) {
                this.updateModel();
            } else {
                throw "Value should be trueValue of falseValue.";
            }
        }
    },
    mounted() {
        this.parent = findComponentUpward(this, "CheckboxGroup");

        if(this.parent) {
            this.group = true;
        }

        if(this.group) {
            this.parent.updateModel(true)
        } else {
            this.updateModel();
            this.showSlot = this.$slots.default !== undefined;
        }
    },
    methods: {
        change(event) {
            if(this.disabled) {
                return false;
            }

            const checked = event.target.checked;
            this.currentValue = checked;

            const value = checked ? this.trueValue : this.falseValue;
            this.$emit("input", value);

            if(this.group) {
                this.parent.change(this.model);
            } else {
                this.$emit("on-change", value);
                this.dispatch("FormItem", "on-form-change", value);
            }
        },
        onFocus() {
            this.focusInner = true;
        },
        onBlur() {
            this.focusInner = false;
        },
        updateModel() {
            this.currentValue = this.value === this.trueValue;
        }
    }
}
</script>