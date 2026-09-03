<template>
    <div class="item">
        <div class="tit">{{ item.name }}</div>
        <div class="li"><span class="lable">演练年份:</span> {{ item.yearDate }}</div>
        <div class="li"><span class="lable">计划单位:</span> {{ item.orgCodeName }}</div>
        <div class="btn">
            <slot name="btn"> </slot>
        </div>
    </div>
</template>
<script lang="ts" setup>
const props = defineProps<{
    item: any;
}>();
</script>
<style lang="less" scoped>
.item {
    width: 100%;
    border-radius: 7px;
    width: 100%;
    background: #f5f5f5;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
}

.tit {
    font-size: 16px;
    font-weight: 600;
    // 两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    width: 100%;
}

.li {
    word-break: break-all;
    // 两行省略号
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    display: flex;

    .lable {
        display: inline-block;
        width: 80px;
    }

    .file {
        flex: 1;
        color: #1890ff;
    }

}

.btn {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    :deep(button) {
        margin-top: 5px !important;
        display: inline-block;
        margin-left: 10px;
    }
}
</style>