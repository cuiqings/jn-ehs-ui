<template>
  <basic-modal v-bind="$attrs" @register="registerModal" :width="600" :title="title" :body-style="{ padding: '0 20px' }" destroyOnClose>
    <div>
      <a-form :model="info" ref="infoRef" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" autocomplete="off">
        <a-form-item label="标题：" name="title" :rules="[{ required: true, message: '标题为必填项！' }]">
          <a-input v-model:value="info.title" placeholder="请输入" />
        </a-form-item>
        <a-form-item :label="title + '：'" name="handlePerson" :rules="[{ required: true, message: `${title}为必填项！` }]">
          <JUserModal v-model:value="info.handlePerson" type="checkbox" />
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
<script lang="ts" name="review-modal" setup>
  import { JUserModal } from '/@/components/Form';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { submitReview, submitAudit } from './url/index';
  import { ref } from 'vue';
  const emit = defineEmits(['success']);
  const title = ref('专业评审');
  const infoRef: any = ref(null);
  const loading = ref(false);
  const info: any = ref({
    pointId: '',
    title: '',
    handlePerson: '',
  });
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    title.value = data.title;
    await infoRef.value.resetFields();
    info.value.title = '';
    info.value.handlePerson = '';
    info.value.pointId = data.ids;
  });
  const confirmClose = async () => {
    await infoRef.value.validate();
    const data = JSON.parse(JSON.stringify(info.value));
    if (title.value === '专业评审') {
      submitReview(data)
        .then(() => {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      submitAudit(data)
        .then(() => {
          //关闭弹窗
          closeModal();
          //刷新列表
          emit('success');
        })
        .finally(() => {
          loading.value = false;
        });
    }
  };
  const close = () => {
    closeModal();
  };
</script>
<style lang="less"></style>
