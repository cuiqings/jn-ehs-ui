<template>
  <div>
    <basic-modal v-bind="$attrs" @register="registerModal" :width="500" title="撤销" wrap-class-name="mark-modal" destroyOnClose @cancel="close">
      <template #closeIcon> <CloseOutlined /></template>
      <a-form ref="formRef" :model="formState" layout="vertical" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
        <a-form-item label="撤销原因：" name="reason" :rules="[{ required: true, message: '请输入撤销原因!' }]">
          <a-textarea :rows="4" v-model:value="formState.reason" placeholder="请输入撤销原因" />
        </a-form-item>
      </a-form>
      <template #footer>
        <div>
          <a-button @click="close">取消</a-button>
          <a-button type="primary" @click="handleSubmit">确定</a-button>
        </div>
      </template>
    </basic-modal>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { CloseOutlined } from '@ant-design/icons-vue';
  const formState = ref({ reason: '', id: '' });
  const formRef = ref();
  const [registerModal, { closeModal }] = useModalInner((data) => {
    formState.value.id = data.id;
  });
  const close = () => {
    formState.value.reason = '';
    closeModal();
  };
  const emit = defineEmits(['submit']);
  const handleSubmit = async () => {
    await formRef.value.validate();
    emit('submit', formState.value, close);
  };
</script>
<style lang="less" scoped>
  .modal-body {
    height: 673px;
    overflow-y: auto;
    .myCanvas {
      position: absolute;
      left: 0;
      top: 0;
    }
    .mark-list {
      display: flex;
      margin-top: 20px;
      .mark-item {
        display: flex;
        margin: 0 15px;
        .mark-title {
          margin-right: 15px;
        }
        .mark-input {
          & > div:nth-child(2) {
            display: flex;
            button {
              margin-left: 10px;
            }
          }
        }
      }
    }
  }
</style>
<style lang="less">
  .mark-modal {
    .scroll-container {
      .scrollbar__wrap {
        margin-bottom: 0 !important;
      }
    }
  }
</style>
