<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="600px" destroyOnClose>
    <BasicForm @register="registerForm">
      <template #teachingHead="{ model, field }">
        <JUserModal v-model:value="model[field]" @confirm="() => clearValidate(['teachingHead'])" />
      </template>
    </BasicForm>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { detailFormSchema } from './plan.data';
  import { saveOrUpdateProject } from './plan.api';
  import { JUserModal } from '/@/components/Form';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const planId = ref('');
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, clearValidate }] = useForm({
    schemas: detailFormSchema,
    showActionButtonGroup: false,
    labelWidth: 120,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    planId.value = data.planId;
    //重置表单
    await resetFields();
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      values.planId = planId.value;
      setModalProps({ confirmLoading: true });
      //提交表单
      //update-end-author:liusq---date:20230404--for: [issue#429]新增通知公告提交指定用户参数有undefined ---
      await saveOrUpdateProject(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
