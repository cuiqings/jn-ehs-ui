<template>
  <div>
    <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="onSubmit" width="700px" destroyOnClose>
      <div>
        <a-form :model="info" ref="infoRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" autocomplete="off">
          <div v-if="title === '检查签字' || title === '确认签字'">
            <a-form-item label="所属单位" name="organizationName">
              <a-input v-model:value="info.organizationName" disabled />
            </a-form-item>
            <a-form-item label="车间" name="departName">
              <a-input v-model:value="info.departName" disabled />
            </a-form-item>
            <a-form-item label="人员姓名" name="userRealname">
              <a-input v-model:value="info.userRealname" disabled />
            </a-form-item>
            <a-form-item label="证件编号" name="certificationsCode">
              <a-input v-model:value="info.certificationsCode" disabled />
            </a-form-item>
          </div>
          <a-form-item
            v-if="title === '检查签字' || title === '批量检查签字'"
            label="签字"
            name="checkSignImg"
            :rules="[{ required: true, message: '签字为必填项！' }]"
          >
            <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
            <JImageUpload v-model:value="info.checkSignImg" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
          </a-form-item>
          <a-form-item v-else label="签字" name="confirmSignImg" :rules="[{ required: true, message: '签字为必填项！' }]">
            <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
            <JImageUpload v-model:value="info.confirmSignImg" :is-watermark="true" :maxCount="1" bizPath="edu" fileType="image" />
          </a-form-item>
        </a-form>
      </div>
    </BasicModal>
  </div>
</template>

<script lang="ts" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { sign } from './certificate.api';
  import { ref, computed } from 'vue';
  import { JImageUpload } from '/@/components/Form';
  import { useUserStore } from '/@/store/modules/user';
  const emit = defineEmits(['success', 'register']);
  const infoRef = ref();
  // 用户信息
  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  const title = ref('检查签字');
  const info = ref({
    id: '',
    organizationName: '',
    departName: '',
    userRealname: '',
    certificationsCode: '',
    confirmSignImg: '',
    checkSignImg: '',
  });

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    Object.assign(info.value, {
      id: '',
      organizationName: '',
      departName: '',
      userRealname: '',
      certificationsCode: '',
      confirmSignImg: '',
      checkSignImg: '',
    });
    if (data.ids) {
      info.value.id = data.ids;
    } else {
      const obj = JSON.parse(JSON.stringify(data.record));
      info.value = obj;
    }
    if (data.title === '检查签字' || data.title === '批量检查签字') {
      if (userInfo.value.signature) {
        if (/^http/i.test(userInfo.value.signature)) info.value.checkSignImg = userInfo.value.signature;
      }
    } else {
      if (userInfo.value.signature) {
        if (/^http/i.test(userInfo.value.signature)) info.value.confirmSignImg = userInfo.value.signature;
      }
    }
    title.value = data.title;
    setModalProps({
      confirmLoading: false,
    });
  });

  async function onSubmit() {
    await infoRef.value.validate();
    setModalProps({ confirmLoading: true });
    try {
      await sign(info.value);
      closeModal();
      emit('success');
      setModalProps({ confirmLoading: false });
    } catch {
      setModalProps({ confirmLoading: false });
    }
  }
</script>

<style lang="less" scoped></style>
