import { ref, onMounted } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { FormSchema } from '/@/components/Table';
import { BasicForm, useForm } from '/@/components/Form/index';
import { edit, add } from '../url/index';
import { getDepart3ListWithSecurity } from '/@/api/common/api';
export const useTeamInfoDrawer = (emit) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const type = ref('edit');
  const orgOptions: any = ref([]);
  const formSchema: FormSchema[] = [
    {
      field: 'id',
      label: '',
      component: 'Input',
      show: false,
    },
    {
      field: 'deviceCode',
      label: '设备编码',
      required: true,
      component: 'Input',
    },
    {
      label: '所属单位',
      field: 'orgCode',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    },
    {
      field: 'deviceName',
      label: '设备名称',
      component: 'Input',
      required: true,
    },
  ];
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
          id: item.id,
        };
      });
    });
  });
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    updateSchema({
      field: 'deviceCode',
      componentProps: {
        disabled: type.value === 'edit',
      },
    });
    updateSchema({
      field: 'orgCode',
      componentProps: () => {
        return {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
    });
    if (data.type === 'edit') {
      const obj = JSON.parse(JSON.stringify(data.data));
      //表单赋值
      await setFieldsValue({
        ...obj,
      });
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  //表单配置
  const [registerForm, { resetFields, updateSchema, validate, setFieldsValue }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 5 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 19 },
    },
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      const obj = JSON.parse(JSON.stringify(values));
      setDrawerProps({ confirmLoading: true });
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
  return {
    showFooter,
    showOkBtn,
    title,
    registerDrawer,
    BasicDrawer,
    handleSubmit,
    registerForm,
    BasicForm,
  };
};
export default useTeamInfoDrawer;
