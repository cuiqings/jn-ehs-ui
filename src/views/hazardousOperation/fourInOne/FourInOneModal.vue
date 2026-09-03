<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>

<script lang="ts" setup name="four-in-one-modal">
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/@/components/Modal';
import { BasicForm, useForm } from '/@/components/Form';
import { formSchema } from './fourInOne.data';
import { saveOrUpdate } from './fourInOne.api';
import { useMessage } from '/@/hooks/web/useMessage';

const emit = defineEmits(['success', 'register']);
const { createMessage } = useMessage();
const isUpdate = ref(true);
const rowId = ref('');

/**
 * 表单配置
 */
const [registerForm, { setFieldsValue, resetFields, validate }] = useForm({
  labelWidth: 100,
  baseColProps: { span: 24 },
  schemas: formSchema,
  showActionButtonGroup: false,
  autoSubmitOnEnter: true,
});

/**
 * 弹窗配置
 */
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  resetFields();
  setModalProps({ confirmLoading: false });
  isUpdate.value = !!data?.isUpdate;

  if (unref(isUpdate)) {
    rowId.value = data.record.id;
    setFieldsValue({
      ...data.record,
    });
  }
});

/**
 * 获取弹窗标题
 */
const getTitle = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));

/**
 * 提交表单
 */
async function handleSubmit() {
  try {
    const values = await validate();
    setModalProps({ confirmLoading: true });
    
    // 处理日期格式
    if (values.lastCleanTime) {
      values.lastCleanTime = values.lastCleanTime.format('YYYY-MM-DD HH:mm:ss');
    }
    
    // 如果是更新操作，添加ID
    if (unref(isUpdate)) {
      values.id = rowId.value;
    }
    
    await saveOrUpdate(values, unref(isUpdate));
    closeModal();
    emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>