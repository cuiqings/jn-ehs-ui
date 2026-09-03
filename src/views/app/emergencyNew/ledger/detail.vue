<template>
    <div class="detail">
        <div class="li"><span class="lable">所属单位：</span>{{ detailInfo.orgCodeName }}</div>
        <div class="li"><span class="lable">应急预案分类：</span>{{ detailInfo.categoryName }}</div>
        <div class="li"><span class="lable">应急预案名称：</span>{{ detailInfo.name }}</div>
        <div class="li">
            <span class="lable">应急预案：</span>
            <div class="file" v-if="detailInfo.annex">
                <AppCustomizeUpload disabled v-model:fileList="detailInfo.annex" />
            </div>
        </div>
    </div>
</template>
<script lang="ts" setup>
import { ledgerDetail } from '/@/views/emergencyNew/api'
import AppCustomizeUpload from '../../components/AppCustomizeUpload.vue';
import { useRoute } from 'vue-router'
import { ref } from 'vue'
const detailInfo = ref({})
const route = useRoute()
const pageInit = async () => {
    let res = await ledgerDetail(route.query.id)
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
            width: 100px;
            color: #777;
        }

        .file {
            flex: 1;
            color: #1890ff;
        }
    }
}
</style>