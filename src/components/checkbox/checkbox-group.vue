<template>
    <div :class="classes">
        <slot></slot>
    </div>
</template>

<script>
import { oneOf, findComponentsDownward } from "../utils/assist";
import Emitter from "../emitter";

const prefixCls = "trade-checkbox-group";
export default {
    name: "CheckboxGroup",
    mixins: [ Emitter ],
    props: {
        value: {
            type: Array,
            default () {
                return []
            }
        },
        size: {
            validator(value) {
                return oneOf(value, ["small", "large", "default"])
            },
            default() {
                return "default"
            }
        }
    },
    computed: {
        classes() {
            return [
                `${prefixCls}`,
                {
                    [`trade-checkbox-${this.size}`]: !!this.size
                }
            ]
        }
    },
    data () {
        return {
            currentValue: this.value,
            childrens: []
        }
    },
    watch: {
        value() {
            this.updateModel(true);
        }
    },
    mounted() {
        this.updateModel(true);
    },
    methods: {
        updateModel(update) {
            this.childrens = findComponentsDownward(this, "Checkbox", "CheckboxGroup");

            if(this.childrens) {
                const { value } = this;
                this.childrens.forEach(child => {
                    child.model = value;

                    if(update) {
                        child.currentValue = value.indexOf(child.label) >= 0;
                        child.group = true;
                    }
                });
            }
        },
        change(data) {
            this.currentValue = data;
            this.$emit("input", data);
            this.$emit("on-change", data);
            this.dispatch("FormItem", "on-form-change", data);
        }
    }
}
</script>