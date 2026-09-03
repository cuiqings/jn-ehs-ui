<template>
  <BasicModal v-bind="$attrs" @register="registerModal" destroyOnClose :title="getTitle" @ok="handleSubmit">
    <BasicForm @register="registerForm" />
  </BasicModal>
</template>
<script lang="ts" setup>
import { ref, computed, unref } from 'vue';
import { BasicModal, useModalInner } from '/src/components/Modal';
import { BasicForm, useForm } from '/src/components/Form';
import { formSchema } from '../deviceCategory.data';
import { loadTreeData, saveOrUpdateDict } from '../deviceCategory.api';
// 获取emit
const emit = defineEmits(['register', 'success']);
const isUpdate = ref(true);
const expandedRowKeys = ref([]);
const treeData = ref([]);
const isSubAdd = ref(false);
const getTitle = ref('');
//表单配置
const [registerForm, { resetFields, setFieldsValue, setProps, validate, updateSchema }] = useForm({
  schemas: formSchema,
  showActionButtonGroup: false,
  labelCol: {
    xs: { span: 24 },
    sm: { span: 4 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 18 },
  },
});
//表单赋值
const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
  //重置表单
  await resetFields();
  expandedRowKeys.value = [];
  setModalProps({ confirmLoading: false, minHeight: 80, showCancelBtn: !!data?.showFooter, showOkBtn: !!data?.showFooter });
  isUpdate.value = !!data?.isUpdate;
  isSubAdd.value = !!!data?.isUpdate;
  if (!data?.showFooter) {
    getTitle.value = '查看';
  } else if (data?.isUpdate) {
    getTitle.value = '编辑';
  } else {
    getTitle.value = '新增';
  }
  if (data?.record) {
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });
  }
  //父级节点树信息
  treeData.value = await loadTreeData({});
  updateSchema({
    field: 'pid',
    componentProps: { treeData },
  });
  // 隐藏底部时禁用整个表单
  setProps({ disabled: !data?.showFooter });
});
//设置标题

/**
 * 根据pid获取展开的节点
 * @param pid
 * @param arr
 */
function getExpandKeysByPid(pid, arr) {
  if (pid && arr && arr.length > 0) {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].key == pid && unref(expandedRowKeys).indexOf(pid) < 0) {
        expandedRowKeys.value.push(arr[i].key);
        getExpandKeysByPid(arr[i]['parentId'], unref(treeData));
      } else {
        getExpandKeysByPid(pid, arr[i].children);
      }
    }
  }
}
//表单提交事件
async function handleSubmit() {
  try {
    let values = await validate();
    setModalProps({ confirmLoading: true });
    //提交表单
    await saveOrUpdateDict(values, isUpdate.value);
    //关闭弹窗
    closeModal();
    //展开的节点信息
    await getExpandKeysByPid(values['pid'], unref(treeData));
    //刷新列表(isUpdate:是否编辑;values:表单信息;expandedArr:展开的节点信息)
    emit('success', { isUpdate: unref(isUpdate), isSubAdd: unref(isSubAdd), values: { ...values }, expandedArr: unref(expandedRowKeys).reverse() });
  } finally {
    setModalProps({ confirmLoading: false });
  }
}
</script>
