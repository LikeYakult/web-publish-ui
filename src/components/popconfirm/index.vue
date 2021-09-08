<template>
    <a-popconfirm v-model="show"
                  :disabled="disabled"
                  :overlayClassName="overlayClassName"
    >
        <template slot="title">
            <slot name="title"></slot>
        </template>
        <template slot="okText">
            <slot name="okText"></slot>
        </template>
        <template slot="cancelText">
            <slot name="cancelText"></slot>
        </template>
        <slot name="content"></slot>
    </a-popconfirm>
</template>

<script>
export default {
    name: "pop-confirm",
    props: {
        disabled: {
            type: Boolean,
            default: false
        },
        icon: {
            type: [Node, String]
        },
        overlayClassName: {
            type: String
        },
        visible: {
            type: Boolean,
            default: false
        },
    },
    data () {
        return {
            show: false
        }
    },
    model: {
        prop: "visible",
        event: "change"
    },
    watch: {
        show(value) {
            this.$emit('change', value);
        },
        visible(value) {
            this.show = value;
            this.$emit('change', value);
        },
    },
}
</script>