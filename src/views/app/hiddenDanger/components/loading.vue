<template>
    <div class="curloading">
        <van-loading size="24px" type="spinner" color="#ffffff" vertical>加载中...</van-loading>
    </div>
</template>
<style lang="less" scoped>
.curloading{
    background: rgba(0, 0, 0, .3);
    position: fixed;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}
</style>