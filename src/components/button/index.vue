<template>
    <button @click="handleBtnClick" ref="button" class="trade-button" :class="{active: rippleButton.toggle}">
        <slot></slot>
        <span class="cover-ripper" :class="{ animate: rippleButton.animate }"></span>
    </button>
</template>

<script>
export default {
    data () {
        return {
            rippleButton: {
                animate: false,
                toggle: false
            }
        }
    },
    methods: {
        handleBtnClick (e) {
            this.rippleButton.animate = true
            let button = e.target
            let ripple = button.querySelector('.__cov-ripple')
            if (ripple) {
                let d = Math.max(button.offsetHeight, button.offsetWidth)
                let x = e.offsetX - ripple.offsetWidth / 2
                let y = e.offsetY - ripple.offsetHeight / 2
                ripple.setAttribute('style', 'height: ' + d + 'px; width: ' + d + 'px; top: ' + y + 'px; left: ' + x + 'px;')
            }
            this.$nextTick(() => {
                setTimeout(() => {
                    this.rippleButton.animate = false
                }, 660)
            })
        }
    }
}
</script>
