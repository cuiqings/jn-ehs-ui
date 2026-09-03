import { ref, onMounted } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { getDepart3ListWithSecurity, add, edit } from '../url/index';
import { selectDeptNew } from '/@/api/common/api';
export const useDrawer = (emit: any) => {
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
      label: '所属车间',
      field: 'workshop',
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
      label: '位置及范围',
      field: 'location',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '有限空间名称',
      field: 'name',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '编号',
      field: 'code',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 30,
      },
    },
    {
      label: '类型',
      field: 'type',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '管理负责人',
      field: 'headUser',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 20,
      },
    },
    {
      label: '危险有害因素',
      field: 'harmfulFactors',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 500,
      },
    },
    {
      label: '是否安装警示牌及标识牌',
      field: 'warningSigns',
      component: 'Select',
      required: true,
      defaultValue: '是',
      componentProps: {
        options: [
          { value: '是', label: '是' },
          { value: '否', label: '否' },
        ],
      },
    },
    {
      label: '本有限空间中最大作业人数',
      field: 'workUserNum',
      component: 'InputNumber',
      required: true,
      componentProps: {
        min: 1,
        precision: 0,
        controls: false,
        style: {
          width: '100%',
        },
      },
    },
    {
      label: '是否有作业指导书',
      field: 'instructionBook',
      component: 'Select',
      required: true,
      defaultValue: '是',
      componentProps: {
        options: [
          { value: '是', label: '是' },
          { value: '否', label: '否' },
        ],
      },
    },
    {
      label: '作业周期',
      field: 'workCycle',
      component: 'InputTextArea',
      required: true,
      componentProps: {
        maxlength: 20,
        autoSize: true,
      },
    },
  ];
  const orgOptions: any = ref([]);
  const workshopOptions: any = ref([]);
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
  //表单配置
  const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema, validate }] = useForm({
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
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    type.value = data.type;
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    workshopOptions.value = [];
    updateSchema({
      field: 'orgCode',
      componentProps: ({ formModel }) => {
        return {
          options: orgOptions.value,
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            formModel.workshop = undefined;
            updateSchema({
              field: 'workshop',
              componentProps: () => {
                return {
                  options: [],
                  showSearch: true,
                  filterOption: (input: string, option: any) => {
                    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  },
                };
              },
            });
            if (value) {
              workshopSchema(value);
            }
          },
        };
      },
    });
    if (data.type === 'add') {
      setFieldsValue({ reportWay: [''] });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0].value,
        });
        workshopSchema(orgOptions.value[0].value);
      }
    }
    if (data.type !== 'add') {
      setFieldsValue({ ...data.data });
      workshopSchema(data.data.orgCode);
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  const workshopSchema = (orgCode) => {
    selectDeptNew({ orgCode }).then((res) => {
      workshopOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'workshop',
        componentProps: () => {
          return {
            options: workshopOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          };
        },
      });
    });
  };
  const handleSubmit = async () => {
    try {
      const values = await validate();
      const data = JSON.parse(JSON.stringify(values));
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        await add(data).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        await edit(data).then((res) => {
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
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    title,
    showFooter,
    showOkBtn,
  };
};
export default useDrawer;
