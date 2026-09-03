import { ref, onMounted } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { add, edit, getDepart3ListWithSecurity, getDeptNew, getListAll } from '../url/index';

export const useDrawer = (emit: any) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('新增');
  const orgOptions: any = ref([]);
  const departOptions: any = ref([]);
  const areaOptions: any = ref([]);
  const type = ref('add');
  const activeKey = ref('1');
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
      field: 'departCode',
      required: true,
      component: 'Select',
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
      field: 'recogId',
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
      label: '设备名称',
      field: 'pointName',
      component: 'InputTextArea',
      required: true,
      ifShow: true,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
    },
    {
      label: '编号',
      field: 'deviceCode',
      component: 'InputTextArea',
      ifShow: true,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
    },
    {
      label: '类别',
      field: 'deviceType',
      component: 'JDictSelectTag',
      required: true,
      ifShow: true,
      componentProps: {
        dictCode: 'sk_rk_device_type',
        placeholder: '请选择',
        stringToNumber: false,
        showChooseOption: false,
      },
    },
    {
      label: '规格型号',
      field: 'deviceModel',
      component: 'InputTextArea',
      ifShow: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '是否特种设备',
      field: 'deviceSpecialFlag',
      component: 'Select',
      required: true,
      ifShow: true,
      defaultValue: '1',
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '2' },
        ],
      },
    },
    {
      label: '作业活动内容',
      field: 'workContent',
      component: 'InputTextArea',
      required: true,
      ifShow: false,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
    },
    {
      label: '岗位地点',
      field: 'workSite',
      component: 'InputTextArea',
      required: true,
      ifShow: false,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
    },
    {
      label: '活动频次',
      field: 'workFrequency',
      component: 'InputTextArea',
      required: true,
      ifShow: false,
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
    },
    {
      label: '是否巡检项',
      field: 'executeFlag',
      component: 'Select',
      required: true,
      ifShow: false,
      defaultValue: '1',
      componentProps: {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '2' },
        ],
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        maxlength: 50,
        rows: 3,
      },
    },
    {
      label: '安全部负责人',
      field: 'securityDepartPersonId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
    },
    {
      label: '厂部主要负责人',
      field: 'factoryMajorManagerId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
    },
    {
      label: '厂部安全科',
      field: 'factorySecurityDepartPersonId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
    },
    {
      label: '车间负责人',
      field: 'workshopManagerId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
    },
    {
      label: '班组负责人',
      field: 'teamManagerId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
    },
    {
      label: '岗位人员',
      field: 'postPersonId',
      required: true,
      component: 'InputTextArea',
      slot: 'userIdSlot',
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
  // 车间
  const getDepartList = (orgCode) => {
    getDeptNew({ orgCode }).then(async (res) => {
      departOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'departCode',
        componentProps: ({ formModel }) => {
          return {
            options: departOptions.value,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
            onChange: (value) => {
              formModel.recogId = undefined;
              updateSchema({
                field: 'recogId',
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
                getAreaList(value);
              }
            },
          };
        },
      });
    });
  };
  // 区域单位
  const getAreaList = (departCode) => {
    getListAll({ departCode }).then((res) => {
      if (res) {
        areaOptions.value = res.map((item: any) => {
          return {
            label: item.recogUnit,
            value: item.id,
          };
        });
        updateSchema({
          field: 'recogId',
          componentProps: () => {
            return {
              options: areaOptions.value,
              showSearch: true,
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
            };
          },
        });
      } else {
        updateSchema({
          field: 'recogId',
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
      }
    });
  };
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
    activeKey.value = data.activeKey;
    updateSchema({
      field: 'pointName',
      label: activeKey.value === '1' ? '设备名称' : '作业活动名称',
    });
    if (activeKey.value === '2') {
      updateSchema({
        field: 'executeFlag',
        ifShow: true,
      });
    } else {
      updateSchema({
        field: 'executeFlag',
        ifShow: false,
      });
    }
    initUpdateSchema(['deviceCode', 'deviceType', 'deviceModel', 'deviceSpecialFlag'], activeKey.value === '1');
    initUpdateSchema(['workContent', 'workSite', 'workFrequency'], activeKey.value !== '1');
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    departOptions.value = [];
    areaOptions.value = [];
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
            formModel.recogId = undefined;
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
              field: 'recogId',
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
              getDepartList(value);
            }
          },
        };
      },
    });
    if (data.type === 'add') {
      if (orgOptions.value?.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
        getDepartList(orgOptions.value[0]?.value);
      }
    }
    if (data.type !== 'add') {
      getDepartList(data.data.orgCode);
      getAreaList(data.data.departCode);
      const obj = JSON.parse(JSON.stringify(data.data));
      //表单赋值
      await setFieldsValue({
        ...obj,
      });
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
  });
  const initUpdateSchema = (formFieldArr, is) => {
    formFieldArr.forEach((item) => {
      updateSchema({
        field: item,
        ifShow: is,
      });
    });
  };
  const handleSubmit = async () => {
    try {
      const values = await validate();
      const obj = JSON.parse(JSON.stringify(values));
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        obj.type = activeKey.value;
        await add({ ...obj }).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        obj.type = activeKey.value;
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
    BasicDrawer,
    registerDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    title,
    showFooter,
    showOkBtn,
    type,
  };
};
export default useDrawer;
