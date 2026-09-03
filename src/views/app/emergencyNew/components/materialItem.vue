<template>
    <div class="item">
        <div class="tit">{{item.categoryName}}</div>
        <div class="li"><span class="lable">所属单位:</span> {{ item.orgCodeName }}</div>
        <div class="li"><span class="lable">所属车间:</span> {{ item.workshopName }}</div>
        <div class="li"><span class="lable">型号:</span> {{ item.workshopName }}</div>
        <div class="li"><span class="lable">检验有效期:</span> {{ item.expirationDate }}</div>
        <div class="check-box" @click.stop="" v-if="isChecked">
            <van-checkbox v-model="item.checked" shape="square"></van-checkbox>
        </div>
    </div>
</template>
<script lang="ts" setup> 
const props = defineProps<{
    item: any;
    isChecked: boolean;
}>();
</script>
<style lang="less" scoped>
.item{
    width: 100%;
    border-radius: 7px;
    width: 100%;
    background: #ffffff;
    border-radius: 10px;
    padding: 10px 15px;
    font-size: 12px;
    margin-bottom: 15px;
    position: relative;
    .check-box{
        position: absolute;
        right: 16px;
        top: 16px;
    }
}
.tit{
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
.li{
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
</style>