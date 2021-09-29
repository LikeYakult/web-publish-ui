<template>
    <div id="app">
        <Radio-group v-model="animal">
            <Radio label="金斑蝶"></Radio>
            <Radio label="爪哇犀牛"></Radio>
            <Radio label="印度黑羚"></Radio>
        </Radio-group>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            animal: '爪哇犀牛'
        }
    }
}
</script>