<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" title="加入黑名单" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <div style="padding-left: 10px; padding-bottom: 10px">是否确认将{{ companyName }}加入黑名单？</div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }" autocomplete="off">
        <a-form-item label="说明：" name="blackRemark" :rules="[{ required: true, message: '说明为必填项！' }]">
          <a-textarea v-model:value="info.blackRemark" placeholder="请输入" :rows="5" :maxlength="300" />
        </a-form-item>
      </a-form>
    </div>
    <template #footer>
      <div style="text-align: right">
        <a-button style="margin-right: 15px" @click="close">取消</a-button>
        <a-button type="primary" :loading="loading" @click="confirmClose">提交</a-button>
      </div>
    </template>
  </basic-modal>
</template>
<script lang="ts" name="blacklist-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { ref } from 'vue';
  import { addBlack } from './url/index';
  const emit = defineEmits(['success']);
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    id: '',
    blackRemark: '',
    blackFlag: '1',
  });
  const companyName = ref('');
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    await infoRef.value.resetFields();
    info.value.blackRemark = '';
    info.value.id = data.id;
    companyName.value = data.companyName;
  });
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    addBlack(data)
      .then(() => {
        //关闭弹窗
        closeModal();
        //刷新列表
        emit('success');
      })
      .finally(() => {
        loading.value = false;
      });
  };
  const close = () => {
    closeModal();
  };
</script>
