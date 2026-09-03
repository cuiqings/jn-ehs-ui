<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="会议签到" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <a-form :model="info" layout="vertical" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
        <a-form-item label="会议主题" name="conferenceTheme">
          <div>{{ info.conferenceTheme }}</div>
        </a-form-item>
        <a-form-item label="会议时间" name="time">
          <div>{{ info.startDate }}~{{ info.endDate }}</div>
        </a-form-item>
        <a-form-item label="会议地点" name="name">
          {{ info.location }}
        </a-form-item>
        <a-form-item label="电子签名" name="name" v-if="userInfo.signature">
          <img style="height: 75px;" :src="userInfo.signature" alt="" />
        </a-form-item>
        <a-form-item label="电子签名" name="sign" v-else :rules="[{ required: true, message: '签字为必填项！' }]">
          <JImageUpload v-model:value="info.sign" :is-watermark="true" :maxCount="1" bizPath="dangerWork" fileType="image" />
          <template #extra><span style="color: red">提示：手机端可更新个人手写签名</span></template>
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">确认签到</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="blacklist-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { sign } from './url/index';
  import { useUserStore } from '/@/store/modules/user';
  import { JImageUpload } from '/@/components/Form';
  import { ref, computed } from 'vue';

  const userStore: any = useUserStore();
  const userInfo = computed(() => userStore.getUserInfo);
  
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    id: '',
    blackRemark: '',
    blackFlag: '1',
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value = data.data;
  });
  const confirmClose = async () => {
    await infoRef.value.validate();
    loading.value = true;
    if(userInfo.value.signature) info.value.sign = userInfo.value.signature;
    const res = await sign({id: info.value.id, sign: info.value.sign}).finally(() => loading.value = false);
    if (res) {
      emit('success');
      close();
    }
  };
  const close = () => {
    closeModal();
  };
</script>
