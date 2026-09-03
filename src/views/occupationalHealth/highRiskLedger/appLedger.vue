<template>
  <div class="appledger">
    <van-form ref="formRef" label-width="75px">
      <van-field
        v-model="formData.numValue"
        name="numValue"
        maxlength="20"
        autosize
        type="textarea"
        label="当前数值"
        placeholder="请填写当前数值"
        required
        :rules="[{ required: true, message: '请输入' }]"
      />
      <van-field name="numValue" label="检测照片" required
        :rules="[{ required: true, message: '请上传' }]">
        <template #input>
          <AppUpload :watermarkText="watermarkText" :maxCount="10" v-model:fileList="formData.checkFile" />
        </template>
      </van-field>
    </van-form>
    <div class="foot">
      <van-button @click="submit" :loading="loading" type="primary">提交</van-button>
    </div>
  </div>
</template>
<script setup>
  import { onMounted, ref } from 'vue';
  import AppUpload from '../../../components/App/AppUpload.vue';
  import { detectionRecord } from './api'
  import { useRoute, useRouter } from 'vue-router';
  import { showSuccessToast } from 'vant';
  const route = useRoute();
  const router = useRouter();
  const formRef = ref();
  const formData = ref({
    numValue: '',
    checkFile: '',
    id: route.query.id,
  });
  onMounted(() => {
    if(route.query.numValue != 'null'){
      formData.value.numValue = route.query.numValue;
    }
  });
  const loading = ref(false);
  const submit = () => {
     formRef.value?.validate()
        .then(() => {
          loading.value = true;
          detectionRecord(formData.value).then(res => {
            showSuccessToast('提交成功');
            router.back();
          }).finally(() => {
            loading.value = false;
          });
        })
        .catch(() => {});
  };
</script>
<style lang="less" scoped>
  .foot {
    width: 100%;
    height: 55px;
    position: fixed;
    bottom: 0;
    left: 0;
    background: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
    border-top: 1px solid #f5f5f5;

    .van-button {
      margin-right: 15px;
    }
  }
</style>
