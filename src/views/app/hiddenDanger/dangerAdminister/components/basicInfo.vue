<template>
    <van-field v-model="formData.departName" name="departName" label="隐患来源" placeholder="隐患来源" />
    <van-field v-model="formData.departName" name="departName" label="巡检计划" placeholder="巡检计划" />
    <van-field v-model="formData.departName" name="departName" label="检查项" placeholder="检查项" />
    <van-field name="yhPicture" label="隐患照片">
        <template #input>
        <AppUpload v-model:fileList="formData.yhPicture" />
        </template>
    </van-field>
    <van-field v-model="formData.yhDescription" name="yhDescription" autosize type="textarea" label=" 隐患描述" placeholder=" 隐患描述" />

    <van-field v-model="formData.departName" name="departName" label="隐患地点" placeholder="隐患地点" />
    <van-field v-model="formData.reporterName" name="reporterName" label="提报人" placeholder="提报人" />
    <van-field v-model="formData.reporterPhone" type="tel" name="reporterPhone" label="提报人电话" placeholder="提报人电话" />
    <van-field v-model="formData.reporterPhone" type="text" name="reporterPhone" label="提报时间" placeholder="提报时间" />
</template>

<script lang="ts" setup>

const props = defineProps({
    formData: {
        type: Object,
        default: () => {}
    }
})
const { formData } = props;

</script>