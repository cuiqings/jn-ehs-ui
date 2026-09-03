<template>
    <div class="detail">
        <div class="tit">{{ detailInfo.categoryName }}</div>
        <div class="li"><span class="lable">所属单位：</span>{{ detailInfo.orgCodeName }}</div>
        <div class="li"><span class="lable">所属车间：</span>{{ detailInfo.workshopName }}</div>
        <div class="li"><span class="lable">位置(使用岗位)：</span>{{ detailInfo.location }}</div>
        <div class="li"><span class="lable">类型:</span>{{ detailInfo.type }}</div>
        <div class="li"><span class="lable">型号：</span>{{ detailInfo.model }}</div>
        <div class="li"><span class="lable">数量：</span>{{ detailInfo.number }}</div>
        <div class="li"><span class="lable">责任人：</span>{{ detailInfo.dutyUserName }}</div>
        <div class="li"><span class="lable">检验日期：</span>{{ detailInfo.checkDateStr }}</div>
        <div class="li"><span class="lable">检验有效：</span>{{ detailInfo.expirationDate }}</div>
    </div>
</template>
<script lang="ts" setup>
import { emergencySuppliesDetail } from '/@/views/emergencyNew/api'
import { useRoute } from 'vue-router'
import { ref } from 'vue'
const detailInfo = ref<any>({})
const route = useRoute()
const pageInit = async () => {
    let res = await emergencySuppliesDetail(route.query.id)
    if (res.annex) {
        res.annex = JSON.parse(res.annex).toString()
    }
    detailInfo.value = res
}
pageInit()
const previewFile = (fileName) => {
    window.open(process.env.VUE_APP_BASE_API + '/api/file/downloadFile?fileName=' + fileName)
}
</script>
<style lang="less" scoped>
.detail {
    width: 100%;
    height: 100%;
    padding: 16px;

    .li {
        padding: 10px 0;
        display: flex;

        .lable {
            display: inline-block;
            width: 120px;
            color: #777;
        }

        .file {
            flex: 1;
            color: #1890ff;
        }
    }
}
</style>