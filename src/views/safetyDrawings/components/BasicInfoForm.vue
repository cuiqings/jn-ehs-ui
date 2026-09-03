<template>
  <div class="basicInfoForm">
    <!-- 表单 -->
    <a-spin :spinning="loading">
      <BasicForm @register="registerForm">
        <template #DateSlot="{ model, field }">
          <a-select
            v-model:value="model['isBusinessExpirationDate']"
            @change="handleChange"
            style="width: 48%; margin-right: 4%"
            placeholder="请选择"
            :disabled="disabledDeadline"
          >
            <a-select-option value="1"> 有截止日期 </a-select-option>
            <a-select-option value="0"> 无截止日期 </a-select-option>
          </a-select>
          <a-date-picker
            :showTime="false"
            valueFormat="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择"
            v-model:value="model[field]"
            style="width: 48%"
            :disabled="disabledPicker"
            :disabledDate="
              (current) => {
                const today = new Date();
                const yesterdayTimestamp = today.getTime() - 24 * 60 * 60 * 1000;
                const currentTimestamp = current.valueOf();
                return currentTimestamp <= yesterdayTimestamp;
              }
            "
            @change="handlePicker"
          />
        </template>
      </BasicForm>
    </a-spin>
  </div>
</template>

<script setup name="basic-info-form" lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { basicInfoSave, basicInfoView } from './url/index';
  import { BasicForm, useForm } from '/@/components/Form';
  import { FormSchema } from '/@/components/Table';
  const props = defineProps({
    companyCode: { type: String, default: '' },
  });
  const emit = defineEmits(['is-edit']);
  const loading = ref<boolean>(false);
  const resData = ref<any>({});
  let disabledPicker = ref<boolean>(true);
  let disabledDeadline = ref<boolean>(true);
  const formSchemaBasic: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '企业名称',
      field: 'enterpriseName',
      component: 'Input',
      colProps: { span: 24 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '统一社会信用代码',
      field: 'unifiedSocialCreditCode',
      component: 'Input',
      colProps: { span: 24 },
      rules: [{ required: true, pattern: /^[a-zA-Z0-9]{18}$/, message: '请输入正确的统一社会信用代码！' }],
    },
    {
      field: 'administrativeDivision',
      label: '行政区划',
      component: 'JAreaLinkage',
      required: true,
      colProps: { span: 24 },
      componentProps: ({ formModel }) => {
        return {
          onChange: (e) => {
            formModel.affiliation = e;
          },
        };
      },
    },
    {
      field: 'establishmentDate',
      label: '成立日期',
      component: 'DatePicker',
      componentProps: {
        showTime: false, // Boolean|Object  控制时分秒显示
        valueFormat: 'YYYY-MM-DD HH:mm:ss',
        style: {
          width: '100%',
        },
        disabledDate: (current) => {
          const today = new Date();
          // 将当前日期转换为时间戳
          const todayTimestamp = today.getTime();
          // 将当前日期之前的日期转换为时间戳
          const currentTimestamp = current.valueOf();
          // 判断当前日期是否在当前日期之前
          return currentTimestamp > todayTimestamp;
        },
      },
      colProps: { span: 8 },
    },
    {
      field: 'legalRepresentative',
      label: '法定代表人(代理人)',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ required: true, min: 0, max: 20, message: '长度不能超过 20 个字符', trigger: 'blur' }],
    },
    {
      field: 'legalRepresentativePhone',
      label: '法定代表人电话',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ required: true, pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      field: 'contacts',
      label: '联系人',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ min: 0, max: 20, message: '长度不能超过 20 个字符', trigger: 'blur' }],
    },
    {
      field: 'contactsPhone',
      label: '联系人电话',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      field: 'dutyPhone',
      label: '24小时值班电话',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      field: 'workFax',
      label: '单位传真',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,20}$/, message: '长度不能超过 20 位' }],
    },
    {
      field: 'registeredAddress',
      label: '注册地址',
      component: 'Input',
      colProps: { span: 16 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      field: 'postalCode',
      label: '邮政编码',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,10}$/, message: '长度不能超过 10 位' }],
    },
    {
      field: 'mailAddress',
      label: '通信地址',
      component: 'Input',
      colProps: { span: 16 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      field: 'affiliation',
      label: '隶属关系',
      component: 'JAreaLinkage',
      colProps: { span: 8 },
    },
    {
      label: '安全生产监管行业类别',
      field: 'safetyProductionSupervision',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'safety_production_supervision',
      },
      colProps: { span: 16 },
    },
    {
      label: '行业类别',
      field: 'industryCategory',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
      },
      rules: [{ required: true, min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }],
      colProps: { span: 24 },
    },
    {
      label: '行业管理部门',
      field: 'managementDepart',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'management_depart',
      },
      colProps: { span: 12 },
    },
    {
      label: '经济类型',
      field: 'economicType',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '经营范围',
      field: 'businessScope',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
      },
      rules: [{ required: true, min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' }],
      colProps: { span: 24 },
    },
    {
      label: '企业生产（经营）状态',
      field: 'enterpriseProductionStatus',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'enterprise_production_status',
      },
      colProps: { span: 8 },
    },
    {
      label: '注册资金（万元）',
      field: 'registeredCapital',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
    },
    {
      label: '员工总数',
      field: 'employeesTotalNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,10}$/, message: '输入正确数字，且长度不能超过 10 位' }],
    },
    {
      label: '资产总额（万元）',
      field: 'assetsTotal',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
    },
    {
      label: '固定资产（万元）',
      field: 'fixedAssets',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
    },
    {
      label: '占地面积（平方米）',
      field: 'coverArea',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
    },
    {
      label: '集团公司名称',
      field: 'groupCompanyName',
      component: 'Input',
      colProps: { span: 24 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '经度（度）',
      field: 'longitude',
      component: 'InputNumber',
      colProps: { span: 12 },
      rules: [{ pattern: /^\d{1,15}(\.\d{1,5})?$/, message: '输入正确数字，支持小数点后5位数，且长度不能超过 20 位' }],
    },
    {
      label: '纬度（度）',
      field: 'latitude',
      component: 'InputNumber',
      colProps: { span: 12 },
      rules: [{ pattern: /^\d{1,15}(\.\d{1,5})?$/, message: '输入正确数字，支持小数点后5位数，且长度不能超过 20 位' }],
    },
    {
      label: '重点监管分类',
      field: 'regulatoryCategories',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'regulatory_categories',
      },
      colProps: { span: 12 },
    },
    {
      label: '营业执照类别',
      field: 'businessLicenseCategory',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'business_license_category',
      },
      colProps: { span: 12 },
    },
    {
      label: '工商营业执照发证机关',
      field: 'issuingAuthority',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '工商营业执照截止日期',
      field: 'businessExpirationDate',
      component: 'Input',
      slot: 'DateSlot',
      colProps: { span: 12 },
    },
    {
      label: '有无截止日期',
      field: 'isBusinessExpirationDate',
      component: 'Input',
      show: false,
    },
    {
      label: '是否高危行业',
      field: 'isHighRiskIndustry',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'yn',
      },
      colProps: { span: 12 },
    },
    {
      label: '安责险行业',
      field: 'safetyLiability',
      component: 'JDictSelectTag',
      componentProps: ({ formModel }) => {
        return {
          dictCode: 'production_operation_mode',
          onChange: (e) => {
            e ? (formModel.isHighRiskIndustry = '1') : (formModel.isHighRiskIndustry = undefined);
          },
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '职业病危害等级',
      field: 'occupationalDisease',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'occupational_disease',
      },
      colProps: { span: 24 },
    },
    {
      label: '备注',
      field: 'remarks',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
      },
      rules: [{ min: 0, max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }],
      colProps: { span: 24 },
    },
  ];
  const btnBack = (s) => {
    switch (s) {
      case 'edit':
        btnEdit();
        break;
      case 'save':
        btnSave();
        break;
      case 'cancel':
        btnCancel();
        break;
      default:
        break;
    }
  };
  const btnEdit = () => {
    //开启表单
    setProps({ disabled: false });
    disabledDeadline.value = false;
    if (resData.value) {
      disabledPicker.value = resData.value.businessExpirationDate ? false : true;
    }
  };
  const btnSave = async () => {
    emit('is-edit', false);
    const values = await validate();
    emit('is-edit', true);
    Object.keys(values).forEach((e) => {
      // 判断是否有下拉框字段undefined 处理
      if (!values[e]) {
        values[e] = '';
      }
    });
    values.dataOrgCode = props.companyCode;
    const res = await basicInfoSave(values);
    if (res) {
      // 编辑成功！
      getFormData();
    }
  };
  const btnCancel = () => {
    getFormData();
  };
  // 获取表单数据
  const getFormData = async () => {
    loading.value = true;
    try {
      const { success, result } = await basicInfoView({ dataOrgCode: props.companyCode });
      if (success) {
        if (!result) {
          resetFields();
        } else {
          resData.value = result;
          setFieldsValue({ ...result });
        }
      } else {
        resData.value = {};
        resetFields();
      }
    } finally {
      setProps({ disabled: true });
      disabledDeadline.value = true;
      disabledPicker.value = true;
      loading.value = false;
    }
  };
  // 注册Form ======
  const [registerForm, { setProps, resetFields, setFieldsValue, validate }] = useForm({
    labelWidth: 200,
    labelAlign: 'left',
    schemas: formSchemaBasic,
    showActionButtonGroup: false,
    compact: true,
    size: 'large',
  });

  const handleChange = (e) => {
    if (e === '1') {
      disabledPicker.value = false;
    } else {
      disabledPicker.value = true;
      setFieldsValue({
        businessExpirationDate: undefined,
      });
    }
  };
  const handlePicker = (e) => {
    if (!e) {
      setFieldsValue({
        isBusinessExpirationDate: undefined,
      });
    } else {
      setFieldsValue({
        isBusinessExpirationDate: '1',
      });
    }
  };
  onMounted(() => {
    getFormData();
  });
  watch(
    () => props.companyCode,
    () => {
      getFormData();
    },
    { deep: true }
  );
  defineExpose({ btnBack });
</script>

<style lang="less" scoped>
  .basicInfoForm {
    border-left: 1px solid #e7e8e9;
    border-bottom: 1px solid #e7e8e9;
  }
  /deep/.ant-col {
    max-width: 100%;
    .ant-form-item {
      margin-bottom: 0px !important;
      min-height: 56px;
      line-height: 56px;

      .ant-form-item-label {
        background: rgba(0, 0, 0, 0.02);
        border-radius: 0px 0px 0px 0px;
        border-top: 1px solid #e7e8e9;
        border-right: 1px solid #e7e8e9;
        padding-left: 16px;
        label {
          color: rgba(0, 0, 0, 0.87);
          font-size: 16px;
          font-family: Source Han Sans CN-Medium, Source Han Sans CN;
          font-weight: 500;
        }
        label[title='行业类别'],
        [title='经营范围'],
        [title='备注'] {
          height: 85px;
          line-height: 24px;
          white-space: pre-wrap;
        }
      }
      .ant-form-item-control {
        background: #ffffff;
        border-top: 1px solid #e7e8e9;
        border-right: 1px solid #e7e8e9;
        padding: 0 8px;
        textarea {
          margin-top: -10px;
          resize: none;
        }
        .ant-input-number {
          width: 100%;
        }
      }
    }
  }
</style>
