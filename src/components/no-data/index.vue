<template>
    <div class="trade-no-login" v-if="!isLogin">
        <div class="login-container" @click="handleClick">
            <img class="icon" src="../../assets/tips.png" />
            <p>{{ $t('app.go-login') }}</p>
        </div>
    </div>
</template>

<script>
export default {
    name: "no-login",
    props: {
        isLogin: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        handleClick() {
            this.$emit("login")
        }
    }
}
</script>