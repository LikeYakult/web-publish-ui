<template>
    <div class="trade-no-data">
        <div class="container">
            <img class="icon" src="~@/assets/tips.png" />
            <p>NoData</p>
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
    }
}
</script>