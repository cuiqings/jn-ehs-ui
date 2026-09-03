import { ref, onMounted } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { add, edit, getDepart3ListWithSecurity, getDeptNew, queryByOrg } from '../url/index';
import { useModal } from '/@/components/Modal';
import { useMessage } from '/@/hooks/web/useMessage';
export const useDrawer = (emit: any) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const orgOptions: any = ref([]);
  const type = ref('add');
  const objInfo: any = ref({});
  const isMark: any = ref(false);
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
      dynamicDisabled: () => type.value !== 'add',
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
      field: 'departCode',
      required: true,
      component: 'Select',
      dynamicDisabled: () => type.value !== 'add',
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
      label: '辨识单元',
      field: 'recogUnit',
      component: 'InputTextArea',
      required: true,
      // dynamicDisabled: () => type.value !== 'add',
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
    },
    {
      label: '是否可见',
      field: 'showFlag',
      defaultValue: '1',
      required: true,
      component: 'Switch',
      componentProps: {
        unCheckedValue: '2',
        checkedValue: '1',
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
    },
  ];
  const markList: any = ref([]);
  const { createMessage } = useMessage();
  const [registerModal, { openModal }] = useModal();
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
  const [registerForm, { setProps, resetFields, setFieldsValue, updateSchema, validate, getFieldsValue }] = useForm({
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
    isMark.value = false;
    markList.value = [];
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    updateSchema({
      field: 'departCode',
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
    updateSchema({
      field: 'orgCode',
      componentProps: ({ formModel }) => {
        return {
          options: orgOptions.value,
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
          onChange: (value) => {
            formModel.departCode = undefined;
            updateSchema({
              field: 'departCode',
              componentProps: () => {
                return {
                  options: [],
                };
              },
            });
            isMark.value = false;
            markList.value = [];
            if (value) {
              getDepartList(value);
            }
          },
        };
      },
    });
    if (data.type === 'add') {
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0].value,
        });
        getDepartList(orgOptions.value[0].value);
      }
    }
    if (data.type !== 'add') {
      const record = JSON.parse(JSON.stringify(data.data));
      objInfo.value = record;
      markList.value = record.locationMarkers || [];
      getDepartList(record.orgCode);
      isMark.value = true;
      await setFieldsValue({ ...record });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then((res) => {
      if (res) {
        const data = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
            id: item.id,
          };
        });
        updateSchema({
          field: 'departCode',
          componentProps: () => {
            return {
              options: data,
              showSearch: true,
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
              onChange: (value) => {
                isMark.value = false;
                markList.value = [];
                if (value) {
                  isMark.value = true;
                }
              },
            };
          },
        });
      } else {
        isMark.value = false;
        markList.value = [];
        updateSchema({
          field: 'departCode',
          componentProps: () => {
            return {
              options: [],
            };
          },
        });
      }
    });
  };
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      const obj = JSON.parse(JSON.stringify(values));
      obj.markList = markList.value;
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
  // 标记值
  const handleGridModalCallback = (data) => {
    markList.value = data;
  };
  const handleMarkModal = () => {
    const obj = getFieldsValue();
    queryByOrg({
      orgCode: obj.orgCode,
      workshopCode: obj.departCode,
    }).then((res) => {
      if (Array.isArray(res) && res.length > 0) {
        openModal(true, {
          ballArr: markList.value,
          title: '网格化标记',
          type: type.value,
          imgUrl: res,
        });
      } else {
        createMessage.info('该车间暂无底图、请先上传底图！');
      }
    });
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
    handleMarkModal,
    objInfo,
    isMark,
    registerModal,
    handleGridModalCallback,
  };
};
export default useDrawer;
