import { ref, onMounted, nextTick } from 'vue';
import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
import { BasicForm, useForm } from '/@/components/Form/index';
import { FormSchema } from '/@/components/Table';
import { getOrganizationNew, getUser, selectDeptNew, add, confirm, rectify, review, queryById } from '../url/index';
import dayjs from 'dayjs';
export const useDrawer = (emit) => {
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('问题录入');
  const orgOptions = ref<any[]>([]);
  const type = ref('add');
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '所属机构',
      field: 'subsidiaryCode',
      component: 'Select',
      required: true,
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
    },
    {
      label: '检查部位',
      field: 'checkSite',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '问题描述',
      required: true,
      field: 'description',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 100,
      },
    },
    {
      label: '问题照片',
      field: 'image',
      component: 'JImageUpload',
      componentProps: {
        fileMax: 10,
        text: '',
        isWatermark: true,
      },
    },
    {
      label: '整改期限',
      field: 'reviseDate',
      component: 'DatePicker',
      required: true,
      defaultValue: new Date(),
      componentProps: {
        format: 'YYYY-MM-DD',
        valueFormat: 'YYYY-MM-DD',
        placeholder: '请选择',
        style: { width: '100%' },
        disabledDate: (currentDate) => {
          return currentDate < dayjs().startOf('day');
        },
      },
    },
    {
      label: '整改责任部门',
      field: 'dutyDepartCode',
      component: 'ApiSelect',
      componentProps: {
        api: selectDeptNew,
        placeholder: '请选择',
        params: { orgCode: undefined },
        numberToString: true,
        labelField: 'departName',
        valueField: 'orgCode',
      },
    },
    {
      label: '责任人',
      field: 'dutyPersonId',
      component: 'ApiSelect',
      componentProps: {
        placeholder: '请选择',
        disabled: true,
        numberToString: true,
        labelField: 'realname',
        valueField: 'id',
        resultField: 'records',
        showSearch: true,
        filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
      },
    },
  ];
  const info = ref<any>({});
  onMounted(() => {
    getOrganizationNew().then((res) => {
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
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 20 },
    },
  });
  const dutyDepartCodeArr: any = ref([]);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    await resetFields();
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    type.value = data.type;
    if (data.type === 'add') {
      updateSchema({
        field: 'dutyPersonId',
        componentProps: {
          disabled: true,
        },
      });
      updateSchema({
        field: 'subsidiaryCode',
        componentProps: ({ formModel }) => {
          return {
            options: orgOptions.value,
            placeholder: '请选择',
            onChange: (value) => {
              formModel.dutyDepartCode = undefined;
              formModel.dutyPersonId = undefined;
              updateSchema({
                field: 'dutyPersonId',
                componentProps: {
                  disabled: true,
                },
              });
              if (value) {
                updateSchema({
                  field: 'dutyDepartCode',
                  componentProps: {
                    params: { orgCode: value },
                    onChange: (value, data) => {
                      formModel.dutyPersonId = undefined;
                      if (value) {
                        updateSchema({
                          field: 'dutyPersonId',
                          componentProps: {
                            api: getUser,
                            params: { departIds: data.id },
                            disabled: false,
                          },
                        });
                      } else {
                        updateSchema({
                          field: 'dutyPersonId',
                          componentProps: {
                            disabled: true,
                          },
                        });
                      }
                    },
                  },
                });
              } else {
                updateSchema({
                  field: 'dutyDepartCode',
                  componentProps: {
                    params: { orgCode: undefined },
                  },
                });
                updateSchema({
                  field: 'dutyPersonId',
                  componentProps: {
                    disabled: true,
                  },
                });
              }
            },
            getPopupContainer: () => document.body,
          };
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          subsidiaryCode: orgOptions.value[0].value,
        });
        updateSchema({
          field: 'dutyDepartCode',
          componentProps: {
            params: { orgCode: orgOptions.value[0]?.value },
            onChange: (value, data) => {
              setFieldsValue({
                dutyPersonId: undefined,
              });
              if (value) {
                updateSchema({
                  field: 'dutyPersonId',
                  componentProps: {
                    api: getUser,
                    params: { departIds: data.id },
                    disabled: false,
                  },
                });
              } else {
                updateSchema({
                  field: 'dutyPersonId',
                  componentProps: {
                    disabled: true,
                  },
                });
              }
            },
          },
        });
      }
    }
    nextTick(async () => {
      const drawerData = JSON.parse(JSON.stringify(data.data));
      if (data.type === 'confirm') {
        drawerData.rectResult = '0';
        const confirmFormSchema: FormSchema[] = [
          {
            label: '',
            field: 'id',
            component: 'Input',
            show: false,
          },
          {
            label: '所属机构',
            field: 'subsidiaryName',
            component: 'Input',
            componentProps: {
              disabled: true,
            },
          },
          {
            label: '检查部位',
            field: 'checkSite',
            component: 'InputTextArea',
            componentProps: {
              disabled: true,
              autoSize: true,
            },
          },
          {
            label: '问题描述',
            field: 'description',
            component: 'InputTextArea',
            componentProps: {
              disabled: true,
              autoSize: true,
            },
          },
          {
            label: '问题照片',
            field: 'image',
            component: 'JImageUpload',
            componentProps: {
              text: '',
              isWatermark: true,
              disabled: true,
            },
          },
          {
            label: '整改结果',
            field: 'rectResult',
            component: 'RadioGroup',
            required: true,
            componentProps: ({ formModel }) => {
              return {
                options: [
                  { label: '未整改', value: '0' },
                  { label: '整改完成', value: '1' },
                ],
                onChange: (e) => {
                  if (e.target.value === '0') {
                    formModel.rectFeedback = '';
                    formModel.rectImage = '';
                    formModel.reviseDate = getYear(new Date());
                    updateSchema([
                      {
                        field: 'rectFeedback',
                        ifShow: false,
                      },
                      {
                        field: 'rectImage',
                        ifShow: false,
                      },
                      {
                        field: 'reviseDate',
                        ifShow: true,
                      },
                      {
                        field: 'dutyDepartCode',
                        ifShow: true,
                      },
                      {
                        field: 'dutyPersonId',
                        ifShow: true,
                      },
                    ]);
                  }
                  if (e.target.value === '1') {
                    formModel.reviseDate = '';
                    formModel.dutyDepartCode = undefined;
                    formModel.dutyPersonId = undefined;
                    updateSchema([
                      {
                        field: 'rectFeedback',
                        ifShow: true,
                      },
                      {
                        field: 'rectImage',
                        ifShow: true,
                      },
                      {
                        field: 'reviseDate',
                        ifShow: false,
                      },
                      {
                        field: 'dutyDepartCode',
                        ifShow: false,
                      },
                      {
                        field: 'dutyPersonId',
                        ifShow: false,
                      },
                    ]);
                  }
                },
                getPopupContainer: () => document.body,
              };
            },
          },
          {
            label: '整改反馈',
            field: 'rectFeedback',
            required: true,
            component: 'InputTextArea',
            ifShow: false,
            componentProps: {
              maxlength: 200,
              rows: 5,
            },
          },
          {
            label: '整改照片',
            field: 'rectImage',
            component: 'JImageUpload',
            ifShow: false,
            componentProps: {
              fileMax: 10,
              text: '',
              isWatermark: true,
            },
          },
          {
            label: '整改期限',
            field: 'reviseDate',
            component: 'DatePicker',
            required: true,
            defaultValue: new Date(),
            componentProps: {
              format: 'YYYY-MM-DD',
              valueFormat: 'YYYY-MM-DD',
              placeholder: '请选择',
              disabled: drawerData.source === '1',
              style: { width: '100%' },
              disabledDate: (currentDate) => {
                return currentDate < dayjs().startOf('day');
              },
            },
          },
          {
            label: '整改责任部门',
            field: 'dutyDepartCode',
            component: 'ApiSelect',
            required: true,
            componentProps: ({ formModel }) => {
              return {
                api: selectDeptNew,
                placeholder: '请选择',
                params: { orgCode: drawerData.subsidiaryCode },
                numberToString: true,
                labelField: 'departName',
                valueField: 'orgCode',
                onChange: (value, exts) => {
                  formModel.dutyPersonId = undefined;
                  if (value && exts) {
                    updateSchema({
                      field: 'dutyPersonId',
                      componentProps: {
                        api: getUser,
                        params: { departIds: exts.id },
                        disabled: false,
                      },
                    });
                  }
                  if (!value) {
                    updateSchema({
                      field: 'dutyPersonId',
                      componentProps: {
                        disabled: true,
                      },
                    });
                  }
                },
                getPopupContainer: () => document.body,
              };
            },
          },
          {
            label: '责任人',
            field: 'dutyPersonId',
            component: 'ApiSelect',
            required: true,
            componentProps: {
              placeholder: '请选择',
              disabled: true,
              numberToString: true,
              labelField: 'realname',
              valueField: 'id',
              resultField: 'records',
              showSearch: true,
              filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            },
          },
        ];
        await setProps({ schemas: confirmFormSchema });
        if (drawerData.dutyDepartCode) {
          await selectDeptNew({ orgCode: drawerData.subsidiaryCode }).then((res) => {
            dutyDepartCodeArr.value = res;
            updateSchema({
              field: 'dutyPersonId',
              componentProps: {
                api: getUser,
                params: { departIds: dutyDepartCodeArr.value.filter((item) => item.orgCode === drawerData.dutyDepartCode)[0].id },
                disabled: false,
              },
            });
          });
        }
      }
      if (data.type === 'rectify') {
        drawerData.rectResult = '0';
        const rectifyFormSchema: FormSchema[] = [
          {
            label: '',
            field: 'id',
            component: 'Input',
            show: false,
          },
          {
            label: '所属机构',
            field: 'subsidiaryName',
            component: 'Input',
            componentProps: {
              disabled: true,
            },
          },
          {
            label: '检查部位',
            field: 'checkSite',
            component: 'InputTextArea',
            componentProps: {
              disabled: true,
              autoSize: true,
            },
          },
          {
            label: '问题描述',
            field: 'description',
            component: 'InputTextArea',
            componentProps: {
              disabled: true,
              autoSize: true,
            },
          },
          {
            label: '问题照片',
            field: 'image',
            component: 'JImageUpload',
            componentProps: {
              text: '',
              isWatermark: true,
              disabled: true,
            },
          },
          {
            label: '整改期限',
            field: 'reviseDate',
            component: 'Input',
            componentProps: {
              disabled: true,
            },
          },
          {
            label: '整改责任部门',
            field: 'dutyDepart',
            component: 'Input',
            componentProps: {
              disabled: true,
            },
          },
          {
            label: '责任人',
            field: 'dutyPerson',
            component: 'Input',
            componentProps: {
              disabled: true,
            },
          },
          {
            field: '',
            component: 'Divider',
            label: '整改记录',
            componentProps: {
              style: {
                color: '#1890ff',
              },
            },
          },
          {
            label: '整改结果',
            field: 'rectResult',
            component: 'RadioGroup',
            required: true,
            componentProps: () => {
              return {
                options: [
                  { label: '整改中', value: '0' },
                  { label: '整改完成', value: '1' },
                ],
                getPopupContainer: () => document.body,
              };
            },
          },
          {
            label: '整改反馈',
            field: 'rectFeedback',
            required: true,
            component: 'InputTextArea',
            componentProps: {
              maxlength: 200,
              rows: 5,
            },
          },
          {
            label: '整改照片',
            field: 'rectImage',
            component: 'JImageUpload',
            componentProps: {
              fileMax: 10,
              text: '',
              isWatermark: true,
            },
          },
        ];
        setProps({ schemas: rectifyFormSchema });
      }
      if (data.type === 'review') {
        drawerData.reviewResult = '0';
        await queryById({ id: drawerData.id }).then((res) => {
          drawerData.rectResult = res.jnEnvironmentalProblemChecklistRecordVos[res.jnEnvironmentalProblemChecklistRecordVos.length - 1].rectResult;
          drawerData.rectFeedback = res.jnEnvironmentalProblemChecklistRecordVos[res.jnEnvironmentalProblemChecklistRecordVos.length - 1].rectFeedback;
          drawerData.rectImage = res.jnEnvironmentalProblemChecklistRecordVos[res.jnEnvironmentalProblemChecklistRecordVos.length - 1].rectImage;
          const reviewFormSchema: FormSchema[] = [
            {
              label: '',
              field: 'id',
              component: 'Input',
              show: false,
            },
            {
              label: '所属机构',
              field: 'subsidiaryName',
              component: 'Input',
              componentProps: {
                disabled: true,
              },
            },
            {
              label: '检查部位',
              field: 'checkSite',
              component: 'InputTextArea',
              componentProps: {
                disabled: true,
                autoSize: true,
              },
            },
            {
              label: '问题描述',
              field: 'description',
              component: 'InputTextArea',
              componentProps: {
                disabled: true,
                autoSize: true,
              },
            },
            {
              label: '问题照片',
              field: 'image',
              component: 'JImageUpload',
              componentProps: {
                text: '',
                isWatermark: true,
                disabled: true,
              },
            },
            {
              label: '整改期限',
              field: 'reviseDate',
              component: 'Input',
              componentProps: {
                disabled: true,
              },
            },
            {
              label: '整改责任部门',
              field: 'dutyDepart',
              component: 'Input',
              componentProps: {
                disabled: true,
              },
            },
            {
              label: '责任人',
              field: 'dutyPerson',
              component: 'Input',
              componentProps: {
                disabled: true,
              },
            },
            {
              field: '',
              component: 'Divider',
              label: '整改记录',
              componentProps: {
                style: {
                  color: '#1890ff',
                },
              },
            },
            {
              label: '整改结果',
              field: 'rectResult',
              component: 'RadioGroup',
              componentProps: () => {
                return {
                  options:
                    res.jnEnvironmentalProblemChecklistRecordVos[res.jnEnvironmentalProblemChecklistRecordVos.length - 1].rectResult === '0'
                      ? [{ label: '整改中', value: '0' }]
                      : [{ label: '整改完成', value: '1' }],
                  disabled: true,
                  getPopupContainer: () => document.body,
                };
              },
            },
            {
              label: '整改反馈',
              field: 'rectFeedback',
              component: 'InputTextArea',
              componentProps: {
                autoSize: true,
                disabled: true,
              },
            },
            {
              label: '整改照片',
              field: 'rectImage',
              component: 'JImageUpload',
              componentProps: {
                fileMax: 10,
                text: '',
                isWatermark: true,
                disabled: true,
              },
            },
            {
              field: '',
              component: 'Divider',
              label: '问题复查',
              componentProps: {
                style: {
                  color: '#1890ff',
                },
              },
            },
            {
              label: '复查结果',
              field: 'reviewResult',
              component: 'RadioGroup',
              required: true,
              componentProps: () => {
                return {
                  options: [
                    { label: '通过', value: '0' },
                    { label: '不通过', value: '1' },
                  ],
                  getPopupContainer: () => document.body,
                };
              },
            },
            {
              label: '复查说明',
              field: 'reviewDetail',
              required: true,
              component: 'InputTextArea',
              componentProps: {
                maxlength: 200,
                rows: 5,
              },
            },
            {
              label: '复查照片',
              field: 'reviewImage',
              component: 'JImageUpload',
              componentProps: {
                fileMax: 10,
                text: '',
                isWatermark: true,
              },
            },
          ];
          setProps({ schemas: reviewFormSchema });
        });
      }
      if (data.type !== 'add') {
        nextTick(() => {
          Object.keys(drawerData).forEach((key) => {
            if (!drawerData[key]) {
              delete drawerData[key];
            }
          });
          setFieldsValue({ ...drawerData });
        });
      }
    });
    if (data.type === 'view') {
      queryById({ id: data.data.id }).then((res) => {
        info.value = res;
      });
    }
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value, title: title.value });
  });
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        await add(values).then(() => {
          close();
        });
      }
      if (type.value === 'confirm') {
        await confirm(values).then(() => {
          close();
        });
      }
      if (type.value === 'rectify') {
        await rectify(values).then(() => {
          close();
        });
      }
      if (type.value === 'review') {
        await review(values).then(() => {
          close();
        });
      }
    } finally {
      setDrawerProps({ confirmLoading: false });
    }
  };
  const getYear = (date) => {
    const y = date.getFullYear() + 30;
    const m = dayjs(date).format('MM');
    const d = dayjs(date).format('DD');
    return dayjs(y + '-' + m + '-' + d).format('YYYY-MM-DD');
  };
  const close = () => {
    //刷新列表
    emit('success');
    //关闭弹窗
    closeDrawer();
  };
  return {
    showFooter,
    showOkBtn,
    title,
    registerDrawer,
    BasicDrawer,
    BasicForm,
    registerForm,
    handleSubmit,
    type,
    info,
  };
};
export default useDrawer;
