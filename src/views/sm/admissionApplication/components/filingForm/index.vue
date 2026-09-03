<template>
  <BasicForm @register="register">
    <template #userIdSlot="{ model, field }">
      <JUserModal v-model:value="model[field]" :orgCode="publishCode" :disabled="type === 'view' || type === 'approval'" @confirm="confirm" />
    </template>
  </BasicForm>
</template>
<script lang="ts" name="filingForm" setup>
  import { onMounted, ref } from 'vue';
  import { BasicForm, useForm } from '/@/components/Form/index';
  import { getDetailList, get3List, getUser, getDepart3List, queryById } from '../../url/index';
  import { getListByCurrent } from '../../url/index';
  import { FormSchema } from '/@/components/Form/index';
  import { JUserModal } from '/@/components/Form';
  import dayjs from 'dayjs';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const emits = defineEmits(['change-contract-code', 'change-xgf-type', 'change-publish-code']);
  const props = defineProps({
    disabled: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
    },
    applicationType: {
      type: String,
    },
  });
  const publishCode = ref('');
  // 新增人员表单
  const schemas1: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'enterId',
      component: 'Select',
      componentProps: {
        options: [],
        placeholder: '请选择',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
        },
      },
      label: '项目名称',
      colProps: {
        span: 12,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      ifShow: () => {
        return props.type === 'add' || props.type === 'edit';
      },
    },
    {
      field: 'projectName',
      component: 'Input',
      label: '项目名称',
      colProps: {
        span: 12,
      },
      componentProps: {
        disabled: true,
      },
      ifShow: () => {
        return props.type === 'view' || props.type === 'approval';
      },
    },
    {
      label: '',
      field: 'contractCode',
      show: false,
      component: 'Input',
    },
    {
      label: '承包单位',
      colProps: {
        span: 12,
      },
      field: 'contractName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '',
      field: 'publishCode',
      show: false,
      component: 'Input',
    },
    {
      label: '发包单位',
      field: 'publishName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: {
        span: 12,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '',
      field: 'publishManagerId',
      show: false,
      component: 'Input',
    },
    {
      label: '发包单位负责人',
      field: 'publishManagerName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: {
        span: 12,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '',
      field: 'contractManagerId',
      show: false,
      component: 'Input',
    },
    {
      label: '承包单位负责人',
      field: 'contractManagerName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: {
        span: 12,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'contractManagerPhone',
      component: 'Input',
      label: '承包单位负责人电话',
      colProps: {
        span: 12,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      componentProps: {
        disabled: true,
      },
    },
  ];
  // 入场申请表单
  const schemas: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      field: 'contractCode',
      component: 'Select',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input: string, option: any) => {
            return option.companyName.toLowerCase().indexOf(input.toLowerCase()) >= 0;
          },
        };
      },
      label: '承包单位',
      colProps: {
        span: 24,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      ifShow: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '承包单位',
      field: 'contractName',
      component: 'Input',
      show: () => {
        return props.type === 'view' || props.type === 'approval';
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'xgfType',
      component: 'Select',
      label: '相关方类别',
      colProps: {
        span: 12,
      },
      defaultValue: '1',
      componentProps: {
        allowClear: false,
        options: [
          {
            label: '施工类',
            value: '1',
          },
          {
            label: '生产服务类',
            value: '2',
          },
          {
            label: '搬倒类',
            value: '3',
          },
        ],
        onChange: (value) => {
          emits('change-xgf-type', value);
        },
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'projectTerm',
      component: 'Select',
      label: '项目期限',
      colProps: {
        span: 12,
      },
      defaultValue: '1',
      componentProps: {
        allowClear: false,
        options: [
          {
            label: '长期',
            value: '1',
          },
          {
            label: '短期',
            value: '2',
          },
        ],
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'projectName',
      component: 'Input',
      label: '项目名称',
      componentProps: {
        maxlength: 100,
      },
      colProps: {
        span: 24,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'contractManagerId',
      component: 'Select',
      label: '承包单位负责人',
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
        };
      },
      colProps: {
        span: 12,
      },
      ifShow: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '承包单位负责人',
      field: 'contractManagerName',
      component: 'Input',
      colProps: {
        span: 12,
      },
      show: () => {
        return props.type === 'view' || props.type === 'approval';
      },
    },
    {
      field: 'contractManagerPhone',
      component: 'Input',
      label: '承包单位负责人电话',
      colProps: {
        span: 12,
      },
      dynamicRules: () => {
        return [{ required: props.type !== 'view' && props.type !== 'approval', pattern: /^1[3456789]\d{9}$/ }];
      },
    },
    {
      label: '经营范围',
      field: 'businessScope',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 200,
      },
      colProps: {
        span: 24,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'publishCode',
      component: 'Select',
      label: '发包单位',
      colProps: {
        span: 12,
      },
      componentProps: () => {
        return {
          options: [],
          placeholder: '请选择',
          showSearch: true,
          filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          onChange: (value) => {
            emits('change-publish-code', value);
          },
        };
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'publishWorkshopCode',
      component: 'Select',
      label: '发包车间',
      colProps: {
        span: 12,
      },
      componentProps: {
        options: [],
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '发包单位负责人',
      field: 'publishManagerId',
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      component: 'InputTextArea',
      colProps: {
        span: 12,
      },
      slot: 'userIdSlot',
    },
    {
      field: 'workerNumber',
      component: 'InputNumber',
      label: '作业人数',
      componentProps: {
        style: {
          width: '100%',
        },
        max: 2,
        min: 1,
        precision: 0,
        disabled: true,
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'specialWorkerNumber',
      component: 'InputNumber',
      label: '特种作业人数',
      componentProps: {
        style: {
          width: '100%',
        },
        max: 2,
        min: 1,
        precision: 0,
        disabled: true,
      },
      colProps: {
        span: 12,
      },
    },
    {
      field: 'workDate',
      component: 'RangePicker',
      label: '施工时间',
      colProps: {
        span: 12,
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => current && dayjs(current).isBefore(dayjs(new Date()).subtract(1, 'day')),
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'projectDangerEvaluate',
      label: '项目危险有害因素辨识及风险评估',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
      colProps: {
        span: 24,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      field: 'evaluateDate',
      component: 'DatePicker',
      label: '评估时间',
      colProps: {
        span: 12,
      },
      componentProps: {
        valueFormat: 'YYYY-MM-DD',
        style: {
          width: '100%',
        },
        disabledDate: (current) => current && dayjs(current).isAfter(dayjs(new Date()).endOf('day')),
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '评估人',
      field: 'evaluatePersonId',
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
      component: 'InputTextArea',
      colProps: {
        span: 12,
      },
      slot: 'userIdSlot',
    },
    {
      field: 'riskMeasure',
      label: '风险控制措施制定',
      component: 'InputTextArea',
      componentProps: {
        autoSize: true,
        maxlength: 300,
      },
      colProps: {
        span: 24,
      },
      required: () => {
        return props.type !== 'view' && props.type !== 'approval';
      },
    },
    {
      label: '是否可见',
      field: 'showFlag',
      defaultValue: '1',
      required: true,
      component: 'Switch',
      componentProps: {
        checkedValue: '1',
        unCheckedValue: '0',
        checkedChildren: '是',
        unCheckedChildren: '否',
      },
    },
  ];
  const orgOptions: any = ref([]);
  const [register, { setProps, updateSchema, resetFields, setFieldsValue, validate, getFieldsValue, clearValidate }] = useForm({
    labelWidth: 220,
    schemas,
    showActionButtonGroup: false,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 8 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 16 },
    },
  });
  onMounted(() => {
    if (props.disabled) {
      setProps({ disabled: true });
    }
  });
  const initSchemas = async (applicationType) => {
    if (applicationType === '新增人员') {
      await setProps({ schemas: schemas1, labelWidth: 160 });
      if (props.type === 'add' || props.type === 'edit') {
        await getListByCurrent().then((res) => {
          const projectArr = res.map((item) => {
            return {
              label: item.projectName,
              value: item.id,
              data: item,
            };
          });
          updateSchema({
            field: 'enterId',
            componentProps: {
              options: projectArr,
              placeholder: '请选择',
              showSearch: true,
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
              onChange: (value, extra) => {
                setFieldsValue({
                  contractCode: undefined,
                  contractName: undefined,
                  publishCode: undefined,
                  publishName: undefined,
                  publishManagerId: undefined,
                  publishManagerName: undefined,
                  contractManagerId: undefined,
                  contractManagerName: undefined,
                  contractManagerPhone: undefined,
                });
                emits('change-contract-code', null);
                if (value) {
                  setFieldsValue({
                    contractCode: extra.data.contractCode,
                    contractName: extra.data.contractName,
                    publishCode: extra.data.publishCode,
                    publishName: extra.data.publishName,
                    publishManagerId: extra.data.publishManagerId,
                    publishManagerName: extra.data.publishManagerName,
                    contractManagerId: extra.data.contractManagerId,
                    contractManagerName: extra.data.contractManagerName,
                    contractManagerPhone: extra.data.contractManagerPhone,
                  });
                  queryById({ id: value }).then((res) => {
                    if (res) {
                      emits('change-contract-code', extra.data.contractCode, res.personList, extra.data.publishCode);
                    }
                  });
                }
                clearValidate([
                  'contractCode',
                  'contractName',
                  'publishCode',
                  'publishName',
                  'publishManagerId',
                  'publishManagerName',
                  'contractManagerId',
                  'contractManagerName',
                  'contractManagerPhone',
                ]);
              },
            },
          });
        });
      }
    } else {
      setProps({ schemas });
    }
  };
  const init = async (code?) => {
    // 获取承包单位
    await getDetailList().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.companyName,
          value: item.orgCode,
          orgId: item.orgId,
          businessScope: item.businessScope,
        };
      });
      if (userStore.userInfo.orgCode.includes('A04B12') && props.applicationType !== '新增人员') {
        const extra = orgOptions.value.filter((item) => userStore.userInfo.orgCode.includes(item.value))[0];
        setFieldsValue({
          contractCode: extra.value,
          contractName: extra.label,
          businessScope: extra.businessScope,
        });
        updateSchema({
          field: 'contractCode',
          componentProps: () => {
            return {
              options: orgOptions.value,
              placeholder: '请选择',
              disabled: true,
            };
          },
        });
        userSchema(extra.orgId);
        emits('change-contract-code', extra.value);
      } else {
        if (props.type === 'add') {
          setFieldsValue({
            contractCode: undefined,
          });
          clearValidate(['contractCode']);
        }
        updateSchema({
          field: 'contractCode',
          componentProps: ({ formModel }) => {
            return {
              options: orgOptions.value,
              placeholder: '请选择',
              disabled: props.applicationType === '新增人员',
              showSearch: true,
              filterOption: (input: string, option: any) => {
                return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              },
              onChange: (value, extra) => {
                userSchema();
                formModel.contractName = undefined;
                formModel.contractManagerId = undefined;
                formModel.contractManagerName = undefined;
                formModel.contractManagerPhone = undefined;
                formModel.businessScope = undefined;
                if (value) {
                  formModel.contractName = extra.label;
                  formModel.businessScope = extra.businessScope;
                  userSchema(extra.orgId);
                }
                emits('change-contract-code', value);
              },
            };
          },
        });
      }
    });
    get3List().then(async (res) => {
      const orgOptions = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      updateSchema({
        field: 'publishCode',
        componentProps: () => {
          return {
            options: orgOptions,
            placeholder: '请选择',
            showSearch: true,
            filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
            onChange: (value) => {
              setFieldsValue({
                publishWorkshopCode: undefined,
                publishManagerId: '',
                evaluatePersonId: '',
              });
              updateSchema({
                field: 'publishWorkshopCode',
                componentProps: {
                  options: [],
                  showSearch: true,
                  filterOption: (input: string, option: any) => {
                    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                  },
                },
              });
              publishCode.value = '';
              if (value) {
                departSchema(value);
                publishCode.value = value;
                clearValidate(['publishManagerId', 'evaluatePersonId', 'publishWorkshopCode']);
              }
              emits('change-publish-code', value);
            },
          };
        },
      });
      if (code) {
        publishCode.value = code;
        departSchema(code);
      }
    });
  };
  const departSchema = async (orgCode) => {
    getDepart3List({ orgCode }).then((res) => {
      if (res) {
        const data = res.map((item) => {
          return {
            label: item.departName,
            value: item.orgCode,
          };
        });
        updateSchema({
          field: 'publishWorkshopCode',
          componentProps: {
            options: data,
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          },
        });
      } else {
        updateSchema({
          field: 'publishWorkshopCode',
          componentProps: {
            options: [],
            showSearch: true,
            filterOption: (input: string, option: any) => {
              return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
            },
          },
        });
      }
    });
  };
  // 回显承包单位负责人
  const initContractManager = async (contractCode, publishCode) => {
    await init(publishCode);
    await departSchema(publishCode);
    await userSchema(orgOptions.value.filter((ite) => ite.value === contractCode)[0]?.orgId);
    await clearValidate();
  };
  // 根据承包单位获取人员
  const userSchema = async (id?) => {
    if (id) {
      await getUser({ departIds: id }).then((res) => {
        const userArr = res.records.map((item) => {
          return {
            label: item.realname,
            value: item.id,
            phone: item.phone,
          };
        });
        updateUser(userArr);
      });
    } else {
      updateUser([]);
    }
  };
  const updateUser = (userArr) => {
    updateSchema({
      field: 'contractManagerId',
      componentProps: ({ formModel }) => {
        return {
          options: userArr,
          placeholder: '请选择',
          showSearch: true,
          disabled: props.applicationType === '新增人员',
          filterOption: (input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0,
          onChange: (value, extra) => {
            formModel.contractManagerPhone = undefined;
            formModel.contractManagerName = undefined;
            if (value) {
              formModel.contractManagerName = extra.label;
              formModel.contractManagerPhone = extra.phone;
            }
          },
        };
      },
    });
  };
  const confirm = () => {
    clearValidate(['publishManagerId', 'evaluatePersonId']);
  };
  defineExpose({
    getFieldsValue,
    validate,
    resetFields,
    setFieldsValue,
    userSchema,
    initSchemas,
    setProps,
    initContractManager,
    init,
  });
</script>
<style lang="less" scoped>
  /deep/ .ant-col-xs-24 {
    width: 100%;
  }
  /deep/ .ant-col-sm-16 {
    max-width: 100%;
  }
</style>
