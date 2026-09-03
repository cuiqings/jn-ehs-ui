<template>
  <BasicDrawer
    v-bind="$attrs"
    @register="registerDrawer"
    :title="title"
    ok-text="提交"
    :width="900"
    @ok="handleSubmit"
    :show-footer="showFooter"
    :show-ok-btn="showOkBtn"
    destroyOnClose
  >
    <BasicForm @register="registerForm" />
  </BasicDrawer>
</template>
<script lang="ts" name="cameraManage-drawer" setup>
  import { ref, onMounted } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/@/components/Drawer';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { FormSchema } from '/@/components/Table';
  import { add, edit, getOrganizationNew } from './url/index';
  import { getStructureData } from '../../configuration/processProductionLineManage/url/index';
  const emit = defineEmits(['success']);
  const orgOptions: any = ref([]);
  const showFooter = ref(true);
  const showOkBtn = ref(false);
  const title = ref('添加设备');
  const type = ref('add');
  const id = ref('');
  const formSchema: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: '',
      component: 'Divider',
      label: '基本信息',
      componentProps: {
        style: {
          color: '#1890ff',
        },
      },
    },
    {
      label: '摄像头名称',
      field: 'cameraName',
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
          placeholder: '请选择',
        };
      },
    },
    {
      label: '工序',
      field: 'structureId',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
        };
      },
    },
    {
      label: '子工序',
      field: 'structureChildId',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择',
      },
    },
    {
      label: '监控位置',
      field: 'monitorLocation',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '排序',
      field: 'sort',
      component: 'InputNumber',
      required: true,
      defaultValue: 0,
      componentProps: {
        style: { width: '100%' },
        recision: 0,
      },
    },
    {
      label: 'AI识别场景',
      field: 'cameraType',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'ai_camera_type',
        placeholder: '请选择',
        mode: 'multiple',
        stringToNumber: false,
        showChooseOption: false,
        onChange: (value: any) => {
          if (value.includes('温度')) {
            updateSchema({
              field: 'regionNum',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'regionNum',
              ifShow: false,
            });
          }
          if (value.includes('OCR识别')) {
            updateSchema({
              field: 'ocrNum',
              ifShow: true,
            });
          } else {
            updateSchema({
              field: 'ocrNum',
              ifShow: false,
            });
          }
        },
      },
    },
    {
      label: '温度区域数量',
      field: 'regionNum',
      component: 'InputNumber',
      required: true,
      ifShow: false,
      componentProps: {
        style: { width: '100%' },
        min: 0,
        precision: 0,
        max: 10,
      },
    },
    {
      label: 'OCR识别数量',
      field: 'ocrNum',
      component: 'InputNumber',
      required: true,
      ifShow: false,
      componentProps: {
        style: { width: '100%' },
        min: 0,
        precision: 0,
        max: 10,
      },
    },
    {
      label: '采集频率类型',
      field: 'frequencyType',
      component: 'Select',
      required: true,
      componentProps: {
        options: [
          {
            label: '秒',
            value: 0,
          },
          {
            label: '分',
            value: 1,
          },
          {
            label: '时',
            value: 2,
          },
        ],
        onChange: (value) => {
          setFieldsValue({
            frequency: undefined,
          });
          if (value === 2) {
            updateSchema({
              field: 'frequency',
              componentProps: {
                max: 23,
              },
            });
          } else {
            updateSchema({
              field: 'frequency',
              componentProps: {
                max: 59,
              },
            });
          }
        },
      },
    },
    {
      label: '采集频率',
      field: 'frequency',
      component: 'InputNumber',
      required: true,
      componentProps: {
        style: { width: '100%' },
        max: 59,
        min: 0,
        precision: 0,
      },
    },
    {
      label: '监控说明',
      field: 'monitorExplain',
      component: 'InputTextArea',
      componentProps: {
        rows: 5,
        maxlength: 200,
      },
    },
    {
      field: 'parameter',
      component: 'Divider',
      label: '摄像头参数',
      componentProps: {
        style: {
          color: '#1890ff',
        },
      },
    },
    {
      label: 'IP',
      field: 'cameraIp',
      component: 'Input',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '用户名',
      field: 'userName',
      component: 'Input',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: '密码',
      field: 'password',
      component: 'Input',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 50,
      },
    },
    {
      label: 'RTSP端口',
      field: 'cameraPort',
      component: 'Input',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 5,
      },
    },
    {
      label: '服务端口',
      field: 'servePort',
      component: 'Input',
      required: true,
      componentProps: {
        autoSize: true,
        maxlength: 5,
      },
    },
    {
      label: '备注',
      field: 'remark',
      component: 'InputTextArea',
      componentProps: {
        rows: 5,
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
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    type.value = data.type;
    await resetFields();
    id.value = '';
    showOkBtn.value = data.showOkBtn;
    showFooter.value = data.showFooter;
    title.value = data.title;
    updateSchema({
      field: 'orgCode',
      componentProps: {
        options: orgOptions.value,
        placeholder: '请选择',
        onChange: (value) => {
          setFieldsValue({
            structureId: undefined,
            structureChildId: undefined,
          });
          updateSchema({
            field: 'structureId',
            componentProps: () => {
              return {
                options: [],
                placeholder: '请选择',
              };
            },
          });
          updateSchema({
            field: 'structureChildId',
            componentProps: {
              options: [],
              placeholder: '请选择',
            },
          });
          if (value) {
            getStructureData({ id: '0', orgCode: value }).then((res) => {
              const data = res.map((item) => {
                return {
                  label: item.name,
                  value: item.id,
                };
              });
              updateSchema({
                field: 'structureId',
                componentProps: ({ formModel }) => {
                  return {
                    options: data,
                    placeholder: '请选择',
                    onChange: (value) => {
                      formModel.structureChildId = undefined;
                      updateSchema({
                        field: 'structureChildId',
                        componentProps: {
                          options: [],
                          placeholder: '请选择',
                        },
                      });
                      if (value) {
                        getStructureData({ id: value, orgCode: formModel.orgCode }).then((res) => {
                          const data = res.map((item) => {
                            return {
                              label: item.name,
                              value: item.id,
                            };
                          });
                          updateSchema({
                            field: 'structureChildId',
                            componentProps: {
                              options: data,
                              placeholder: '请选择',
                            },
                          });
                        });
                      }
                    },
                  };
                },
              });
            });
          }
        },
      },
    });
    updateSchema({
      field: 'ocrNum',
      ifShow: false,
    });
    updateSchema({
      field: 'regionNum',
      ifShow: false,
    });
    if (data.type === 'add') {
      updateSchema({
        field: 'structureId',
        componentProps: () => {
          return {
            options: [],
            placeholder: '请选择',
          };
        },
      });
      updateSchema({
        field: 'structureChildId',
        componentProps: {
          options: [],
          placeholder: '请选择',
        },
      });
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0].value,
        });
        getStructureData({ id: '0', orgCode: orgOptions.value[0].value }).then((res) => {
          const data = res.map((item) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
          updateSchema({
            field: 'structureId',
            componentProps: ({ formModel }) => {
              return {
                options: data,
                placeholder: '请选择',
                onChange: (value) => {
                  formModel.structureChildId = undefined;
                  updateSchema({
                    field: 'structureChildId',
                    componentProps: {
                      options: [],
                      placeholder: '请选择',
                    },
                  });
                  if (value) {
                    getStructureData({ id: value, orgCode: formModel.orgCode }).then((res) => {
                      const data = res.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                      updateSchema({
                        field: 'structureChildId',
                        componentProps: {
                          options: data,
                          placeholder: '请选择',
                        },
                      });
                    });
                  }
                },
              };
            },
          });
        });
      }
    }
    if (data.type !== 'add') {
      const record = JSON.parse(JSON.stringify(data.data));
      if (record.orgCode) {
        getStructureData({ id: '0', orgCode: record.orgCode }).then((res) => {
          const data = res.map((item) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
          updateSchema({
            field: 'structureId',
            componentProps: ({ formModel }) => {
              return {
                options: data,
                placeholder: '请选择',
                onChange: (value) => {
                  formModel.structureChildId = undefined;
                  updateSchema({
                    field: 'structureChildId',
                    componentProps: {
                      options: [],
                      placeholder: '请选择',
                    },
                  });
                  if (value) {
                    getStructureData({ id: value, orgCode: formModel.orgCode }).then((res) => {
                      const data = res.map((item) => {
                        return {
                          label: item.name,
                          value: item.id,
                        };
                      });
                      updateSchema({
                        field: 'structureChildId',
                        componentProps: {
                          options: data,
                          placeholder: '请选择',
                        },
                      });
                    });
                  }
                },
              };
            },
          });
        });
      }
      if (record.structureId) {
        getStructureData({ id: record.structureId, orgCode: record.orgCode }).then((res) => {
          const data = res.map((item) => {
            return {
              label: item.name,
              value: item.id,
            };
          });
          updateSchema({
            field: 'structureChildId',
            componentProps: {
              options: data,
              placeholder: '请选择',
            },
          });
        });
      }
      if (record.cameraType.split(',').includes('OCR识别')) {
        updateSchema({
          field: 'ocrNum',
          ifShow: true,
        });
      }
      if (record.cameraType.split(',').includes('温度')) {
        updateSchema({
          field: 'regionNum',
          ifShow: true,
        });
      }
      record.cameraType = record.cameraType.split(',');
      setFieldsValue({ ...record });
      id.value = record.id;
      if (data.type === 'view') setProps({ disabled: !data.showOkBtn });
    }
    // 更新抽屉
    setDrawerProps({ confirmLoading: false, showFooter: showFooter.value, showOkBtn: showOkBtn.value });
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
  const handleSubmit = async () => {
    try {
      const values = await validate();
      setDrawerProps({ confirmLoading: true });
      if (type.value === 'add') {
        await add(values).then((res) => {
          if (res) {
            //刷新列表
            emit('success');
            //关闭弹窗
            closeDrawer();
          }
        });
      } else {
        await edit(values).then((res) => {
          console.log(res, 11);
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
