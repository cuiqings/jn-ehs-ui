<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="700"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="equipmentManage-ledger-drawer" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { add, edit } from './api';
  const emit = defineEmits(['success']);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const type = ref('add');
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '物料分类',
      field: 'type',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'lb_supply_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
      required: true,
    },
    {
      label: '物料名称',
      field: 'name',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '规格型号',
      field: 'model',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '物料编码',
      field: 'code',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '单位',
      field: 'unit',
      required: true,
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '单价',
      field: 'price',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '生产厂家',
      field: 'manufacturer',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
      },
    },
  ];
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    type.value = data.type;
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    if (data.type !== 'add') {
      const record = JSON.parse(JSON.stringify(data.data));
      await setFieldsValue({ ...record });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      const obj = JSON.parse(JSON.stringify(values));
      if (type.value === 'add') {
        await add({ ...obj }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        await edit({ ...obj }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
</script>
<style lang="less" scoped></style>
