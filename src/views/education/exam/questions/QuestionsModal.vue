<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="title" @ok="handleSubmit" width="500px" destroyOnClose>
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
  import { ref, computed, unref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { formSchema } from './questions.data';
  import { saveOrUpdateBank, loadTreeData } from './questions.api';
  // 声明Emits
  const emit = defineEmits(['register', 'success']);
  const isUpdate = ref(true);
  const categoryTreeData = ref([]);
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    //重置表单
    await resetFields();
    categoryTreeData.value = [];
    setModalProps({ confirmLoading: false });
    isUpdate.value = !!data?.isUpdate;
    // 类型
    loadTreeData({
      async: false,
      pcode: 'A02',
    }).then((res) => {
      if (Array.isArray(res)) {
        categoryTreeData.value = processTreeData(res);
        updateSchema({
          field: 'category',
          componentProps: () => {
            return {
              treeDataArr: categoryTreeData.value,
              fieldNames: {
                label: 'title',
                value: 'code',
                options: 'children',
              },
              treeNodeFilterProp: 'title',
              isLeaf: false,
              load: false,
            };
          },
        });
      }
    });
    if (unref(isUpdate)) {
      //表单赋值
      await setFieldsValue({
        ...data.record,
      });
    }
  });
  const processTreeData = (data) => {
    return data.map((item) => {
      // 递归处理子节点
      if (item.children && item.children.length > 0) {
        item.children = processTreeData(item.children);
      }
      // 删除 key 字段
      delete item.key;
      return item;
    });
  };
  //设置标题
  const title = computed(() => (!unref(isUpdate) ? '新增' : '编辑'));
  //表单提交事件
  async function handleSubmit() {
    try {
      let values = await validate();
      setModalProps({ confirmLoading: true });
      //提交表单
      //update-end-author:liusq---date:20230404--for: [issue#429]新增通知公告提交指定用户参数有undefined ---
      await saveOrUpdateBank(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }
</script>
