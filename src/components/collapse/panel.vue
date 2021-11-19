<template>
    <div :class="itemClasses">
        <div :class="headerClasses" @click="toggle">
            <i class="iconfont icon-icon_turnr1" v-if="!hideArrow" />
            <slot></slot>
        </div>
        <collapse-transition v-if="mounted">
            <div :class="contentClasses" v-show="isActive">
                <div :class="boxClasses">
                    <slot name="content"></slot>
                </div>
            </div>
        </collapse-transition>
    </div>
</template>

<script>
import CollapseTransition from "../base/collapse-transition";
const prefixCls = "trade-collapse";
export default {
    name: "Panel",
    components: { CollapseTransition },
    props: {
        name: {
            type: String,
        },
        hideArrow: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            prefixCls,
            index: 0,
            isActive: false,
            mounted: false
        }
    },
    computed: {
        itemClasses() {
            return [
                `${prefixCls}-item`,
                {
                    [`${prefixCls}-item-active`]: this.isActive
                }
            ]
        },
        headerClasses() {
            return `${prefixCls}-header`;
        },
        contentClasses() {
            return `${prefixCls}-content`;
        },
        boxClasses() {
            return `${prefixCls}-content-box`;
        }
    },
    mounted() {
        this.mounted = true;
    },
    methods: {
        toggle() {
            this.$parent.toggle({
                name: this.name || this.index,
                isActive: this.isActive
            })
        }
    }
}
</script>