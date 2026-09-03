<template>
    <div class="dangerous-work">
        <div class="item">
            <router-link to="/app/dangerousWork/ask">作业申请</router-link>
        </div>
        <div class="item">
            <router-link to="/app/dangerousWork/approve">作业审批</router-link>
        </div>
        <div class="item">
            <router-link to="/app/dangerousWork/manage">作业管理</router-link>
        </div>
    </div>
</template>
<script lang="ts" setup>
</script>

<style lang="less" scoped>
.dangerous-work {
    width: 100%;
    height: 100%;
    padding: 15px;
    display: flex;
    justify-content: space-around;
    .item {
        width: 30%;
        height: 120px;
        text-align: center;
    }
}
</style>

