<template>
  <BasicModal v-bind="$attrs" @register="registerModal" title="奖励" @ok="handleSubmit" width="600px" destroyOnClose>
    <div style="padding: 20px">
      <a-descriptions bordered size="small" :column="1" style="margin-bottom: 20px">
        <a-descriptions-item label="隐患描述">{{ record.yhDescription }}</a-descriptions-item>
        <a-descriptions-item label="举报人">{{ record.reporterName }}</a-descriptions-item>
        <a-descriptions-item v-if="record.replyYhLevel" label="隐患等级">{{ getReplyYhLevelText(record.replyYhLevel) }}</a-descriptions-item>
      </a-descriptions>
      <a-form ref="formRef" :model="formData" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="奖励金额 (元)" name="amount">
          <a-input-number
            v-model:value="formData.amount"
            placeholder="请输入奖励金额"
            style="width: 100%"
            :min="1"
            :max="999999"
            :precision="0"
          />
        </a-form-item>
        <a-form-item label="备注" name="remark">
          <a-textarea v-model:value="formData.remark" placeholder="请输入奖励备注说明" :rows="4" :maxlength="500" />
        </a-form-item>
      </a-form>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, reactive } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { reward } from './api';

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const formRef = ref();
  const record = ref<any>({});

  const formData = reactive({
    amount: undefined,
    remark: '',
  });

  const rules = {
    amount: [{ required: true, message: '请输入奖励金额' }],
  };

  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    setModalProps({ confirmLoading: false });
    record.value = data || {};

    // Reset form
    formData.amount = undefined;
    formData.remark = '';
    formRef.value?.clearValidate();
  });

  /**
   * 获取举报层级文本
   * @param val 举报层级值
   */
  function getReplyYhLevelText(val: string) {
    if (val === '1') return '一般隐患';
    if (val === '2') return '重大隐患';
    return val;
  }

  async function handleSubmit() {
    try {
      await formRef.value.validate();
      setModalProps({ confirmLoading: true });
      await reward({ ...formData, id: record.value.id });
      closeModal();
      emit('success');
    } catch (error) {
      console.error(error);
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
