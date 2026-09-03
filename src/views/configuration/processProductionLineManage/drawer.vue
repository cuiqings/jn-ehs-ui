<template>
  <BasicDrawer
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    :title="title"
    :width="900"
    destroyOnClose
    ok-text="提交"
    v-bind="$attrs"
    @ok="handleSubmit"
    @register="registerDrawer"
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="processProductionLineManage-drawer" setup>
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { getOrganizationNew, add, edit, details } from './url/index';
  import { ref, onMounted } from 'vue';

  const emit = defineEmits(['success']);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const type = ref('add');
  const orgOptions = ref<any[]>([]);
  const processType = ref<any>(null);
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'processId',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'subProcessId',
      component: 'Input',
      show: false,
    },
    {
      label: '',
      field: 'type',
      component: 'Input',
      show: false,
    },
    {
      label: '工序名称',
      field: 'name',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '所属机构',
      field: 'orgCode',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
        };
      },
    },
    {
      label: '所属工序',
      field: 'processName',
      component: 'Input',
      required: true,
      ifShow: false,
      componentProps: () => {
        return {
          disabled: true,
        };
      },
    },
    {
      label: '所属子工序',
      field: 'subProcessName',
      component: 'Input',
      required: true,
      ifShow: false,
      componentProps: () => {
        return {
          disabled: true,
        };
      },
    },
    {
      label: '排序',
      field: 'sortNum',
      component: 'InputNumber',
      required: true,
      defaultValue: 0,
      componentProps: {
        style: { width: '100%' },
        recision: 0,
      },
    },
    {
      label: '工序描述',
      field: 'description',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 200,
      },
    },
  ];
  onMounted(() => {
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  });
  //表单配置
  const [registerForm, { resetFields, setFieldsValue, updateSchema, validate }] = useForm({
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
    processType.value = data.processType;
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    updateSchema({
      field: 'orgCode',
      componentProps: () => {
        return {
          options: orgOptions.value,
          placeholder: '请选择',
        };
      },
    });
    // 新增工序
    if (data.processType) {
      updateSchema({
        field: 'orgCode',
        componentProps: () => {
          return {
            options: orgOptions.value,
            disabled: true,
          };
        },
      });
      setFieldsValue({
        orgCode: data.data.orgCode,
      });
    }
    if (!data.processType) {
      updateSchema({
        field: 'orgCode',
        componentProps: () => {
          return {
            options: orgOptions.value,
            disabled: false,
          };
        },
      });
      updateSchema({
        field: 'name',
        label: '工序名称',
      });
      updateSchema({
        field: 'processName',
        ifShow: false,
      });
      updateSchema({
        field: 'subProcessName',
        ifShow: false,
      });
    } else if (data.processType === '工序') {
      if (data.type === 'add') {
        updateSchema({
          field: 'name',
          label: '子工序名称',
        });
        updateSchema({
          field: 'processName',
          ifShow: true,
        });
        updateSchema({
          field: 'subProcessName',
          ifShow: false,
        });
        setFieldsValue({
          processName: data.data.name,
        });
        setFieldsValue({
          processId: data.data.id,
        });
      } else {
        updateSchema({
          field: 'name',
          label: '工序名称',
        });
        updateSchema({
          field: 'processName',
          ifShow: false,
        });
        updateSchema({
          field: 'subProcessName',
          ifShow: false,
        });
        setFieldsValue({
          id: data.data.id,
        });
      }
    } else if (data.processType === '子工序') {
      if (data.type === 'add') {
        updateSchema({
          field: 'name',
          label: '产线名称',
        });
        updateSchema({
          field: 'processName',
          ifShow: true,
        });
        updateSchema({
          field: 'subProcessName',
          ifShow: true,
        });
        setFieldsValue({
          processName: data.data.processName,
          subProcessName: data.data.name,
        });
        setFieldsValue({
          subProcessId: data.data.id,
        });
      } else {
        updateSchema({
          field: 'name',
          label: '子工序名称',
        });
        updateSchema({
          field: 'processName',
          ifShow: true,
        });
        updateSchema({
          field: 'subProcessName',
          ifShow: false,
        });
        setFieldsValue({
          processName: type.value == data.data.name,
        });
        setFieldsValue({
          processId: data.data.id,
        });
      }
    }
    if (data.type !== 'add' && data.processType === '产线') {
      updateSchema({
        field: 'name',
        label: '产线名称',
      });
      updateSchema({
        field: 'processName',
        ifShow: false,
      });
      updateSchema({
        field: 'subProcessName',
        ifShow: true,
      });
      setFieldsValue({
        subProcessName: data.data.name,
      });
      setFieldsValue({
        subProcessId: data.data.id,
      });
    }
    if (data.type === 'add') {
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0].value,
        });
      }
    }
    if (data.type !== 'add') {
      await details({
        id: data.data.id,
      }).then(async (res) => {
        if (res) {
          const record = JSON.parse(JSON.stringify(res));
          await setFieldsValue({ ...record });
        }
      });
    }
    // 更新抽屉
    setDrawerProps({
      confirmLoading: false,
      showFooter: showFooter.value,
      showOkBtn: showOkBtn.value,
    });
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      const data = JSON.parse(JSON.stringify(values));
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        if (!processType.value) data.type = '工序';
        if (processType.value === '工序') data.type = '子工序';
        if (processType.value === '子工序') data.type = '产线';
        await add({ ...data }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        await edit({ ...data }).then((res) => {
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
