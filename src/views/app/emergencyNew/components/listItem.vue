<template>
    <div class="item">
        <div class="tit">{{item.name}}</div>
        <div class="li"><span class="lable">应急预案分类:</span> {{ item.categoryName }}</div>
        <div class="li"><span class="lable">所属单位:</span> {{ item.orgCodeName }}</div>
        <div class="li">
            <span class="lable">应急预案：</span>
            <div class="file" v-if="item.annex" @click.stop="()=>{}">
                <AppCustomizeUpload disabled v-model:fileList="item.annex" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup> 
import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
const props = defineProps<{
    item: any;
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