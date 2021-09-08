<template>
    <div :class="[prefixCls + '-confirm']" @keydown.tab.capture="handleTab">
        <button :class="timeClasses"
                :disabled="timeDisabled"
                v-if="showTime"
                @click="handleToggleTime"
        >
            {{ isTime ? $t("app.select-date") : $t("app.select-time") }}
        </button>
        <button class="btn" :class="[prefixCls + '-confirm-clear']" @click="handleClear" @keydown.enter="handleClear">
            {{ $t("app.clear") }}
        </button>
        <button class="btn" :class="[prefixCls + '-confirm-ok']" @click="handleSuccess" @keydown.enter="handleSuccess">
            {{ $t("app.ok") }}
        </button>
    </div>
</template>
<script>
import Emitter from '../../emitter';

const prefixCls = 'trade-picker';

export default {
    mixins: [Emitter],
    props: {
        showTime: {
            type: Boolean,
            default: false
        },
        isTime: {
            type: Boolean,
            default: false
        },
        timeDisabled: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            prefixCls: prefixCls
        };
    },
    computed: {
        timeClasses () {
            return  `${prefixCls}-confirm-time`;
        }
    },
    methods: {
        handleClear () {
            this.$emit('on-pick-clear');
        },
        handleSuccess () {
            this.$emit('on-pick-success');
        },
        handleToggleTime () {
            if (this.timeDisabled) return;
            this.$emit('on-pick-toggle-time');
            this.dispatch('CalendarPicker', 'focus-input');
            this.dispatch('CalendarPicker', 'update-popper');
        },
        handleTab(e) {
            const tabbables = [...this.$el.children];
            const expectedFocus = tabbables[e.shiftKey ? 'shift' : 'pop']();

            if (document.activeElement === expectedFocus) {
                e.preventDefault();
                e.stopPropagation();
                this.dispatch('CalendarPicker', 'focus-input');
            }
        }
    }
};
</script>