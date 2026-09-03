<!-- 随手拍非隐患处理 -->
<template>
  <van-form ref="formRef" label-width="75px">
    <template v-if="props.pageType == 3">
      <van-field required name="radio" label="整改情况" :rules="[{ required: true, message: '请选择整改情况' }]">
        <template #input>
          <van-radio-group v-model="formData.handleResult" direction="horizontal">
            <van-radio name="1">整改完成</van-radio>
            <van-radio name="2">整改中</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        required
        v-model="formData.description"
        name="description"
        autosize
        :maxlength="300"
        type="textarea"
        label="整改反馈"
        :rules="[{ required: true, message: '请填写整改反馈' }]"
        placeholder="请填写整改反馈"
      />
      <van-field label-width="80" required name="picture" label="整改后照片" :rules="[{ required: true, message: '请上传整改后照片' }]">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.picture" />
        </template>
      </van-field>
    </template>
    <template v-if="props.pageType == 5">
      <van-field required name="radio" label="验收结果" :rules="[{ required: true, message: '请选择验收结果' }]">
        <template #input>
          <van-radio-group v-model="formData.handleResult" direction="horizontal">
            <van-radio name="1">验收通过</van-radio>
            <van-radio name="2">验收不通过</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        required
        v-model="formData.description"
        name="description"
        autosize
        :maxlength="200"
        type="textarea"
        label="处理说明"
        :rules="[{ required: true, message: '请填写处理说明' }]"
        placeholder="请填写处理说明"
      />
      <van-field name="picture" label=" ">
        <template #input>
          <AppUpload :watermarkText="watermarkText" v-model:fileList="formData.picture" />
        </template>
      </van-field>
    </template>
  </van-form>
</template>

<script setup lang="ts">
  import AppUpload from '../../../../../components/App/AppUpload.vue';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user';
  import { reactive, ref } from 'vue';
  const props = withDefaults(defineProps<{ pageType: number | string }>(), { pageType: 3 });
  const formRef = ref<HTMLFormElement | null>(null);
  const formData = reactive({
    handleResult: '',
    description: '',
    picture: '',
  });
  const userStore: any = useUserStore();

  const watermarkText = ref(`${userStore.getUserInfo.realname} ${userStore.getUserInfo.workNo} ${dateFormat(new Date(),'yyyy-MM-dd  hh:mm:ss')} 上传`)


  const submitForm = () => {
    return new Promise((resolve, reject) => {
      formRef.value
        ?.validate()
        .then(() => {
          resolve(formData);
        })
        .catch(() => {
          reject(false);
        });
    });
  };

  defineExpose({ submitForm });
</script>

<style lang="less" scoped></style>
