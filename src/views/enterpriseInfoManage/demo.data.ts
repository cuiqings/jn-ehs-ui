import { FormSchema } from '/@/components/Table';
import { useMessage } from '/@/hooks/web/useMessage';
const { createMessage } = useMessage();
// 企业基础信息
export const formSchemaBasic: FormSchema[] = [
  {
    label: '企业名称',
    field: 'enterpriseName',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '统一社会信用代码',
    field: 'unifiedSocialCreditCode',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ pattern: /^[a-zA-Z0-9]{18}$/, message: '请输入正确的统一社会信用代码！' }],
  },
  {
    field: 'administrativeDivision',
    label: '行政区划',
    component: 'JAreaLinkage',
    colProps: { span: 24, },
    componentProps: ({ formActionType, formModel }) => {
      return {
        onChange: e => {
          formModel.affiliation = e
        }
      }
    },
  },
  {
    field: 'establishmentDate',
    label: '成立日期',
    component: 'DatePicker',
    componentProps: {
      showTime: false,  // Boolean|Object  控制时分秒显示
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
    rules: [{ min: 0, max: 20, message: '长度不能超过 20 个字符', trigger: 'blur' }],
  },
  {
    field: 'legalRepresentativePhone',
    label: '法定代表人电话',
    component: 'Input',
    colProps: { span: 8 },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
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
    colProps: { span: 8, },
  },
  {
    label: '安全生产监管行业类别',
    field: 'safetyProductionSupervision',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'safety_production_supervision',
    },
    colProps: { span: 16, },
  },
  {
    label: '行业类别',
    field: 'industryCategory',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 200, message: '长度不能超过 200 个字符', trigger: 'blur' }],
    colProps: { span: 24, },
  },
  {
    label: '行业管理部门',
    field: 'managementDepart',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'management_depart',
    },
    colProps: { span: 12, },
  },
  {
    label: '经济类型',
    field: 'economicType',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '经营范围',
    field: 'businessScope',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' }],
    colProps: { span: 24, },
  },
  {
    label: '企业生产（经营）状态',
    field: 'enterpriseProductionStatus',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'enterprise_production_status',
    },
    colProps: { span: 8, },
  },
  {
    label: '注册资金（万元）',
    field: 'registeredCapital',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
  },
  {
    label: '员工总数',
    field: 'employeesTotalNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,10}$/, message: '输入正确数字，且长度不能超过 10 位' }],
  },
  {
    label: '资产总额（万元）',
    field: 'assetsTotal',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
  },
  {
    label: '固定资产（万元）',
    field: 'fixedAssets',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
  },
  {
    label: '占地面积（平方米）',
    field: 'coverArea',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,8}(\.\d{1,2})?$/, message: '输入正确数字，且长度不能超过 10 位' }],
  },
  {
    label: '集团公司名称',
    field: 'groupCompanyName',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '经度（度）',
    field: 'longitude',
    component: 'InputNumber',
    colProps: { span: 12, },
    rules: [{ pattern: /^\d{1,15}(\.\d{1,5})?$/, message: '输入正确数字，支持小数点后5位数，且长度不能超过 20 位' }],
  },
  {
    label: '纬度（度）',
    field: 'latitude',
    component: 'InputNumber',
    colProps: { span: 12, },
    rules: [{ pattern: /^\d{1,15}(\.\d{1,5})?$/, message: '输入正确数字，支持小数点后5位数，且长度不能超过 20 位' }],
  },
  {
    label: '重点监管分类',
    field: 'regulatoryCategories',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'regulatory_categories',
    },
    colProps: { span: 12, },
  },
  {
    label: '营业执照类别',
    field: 'businessLicenseCategory',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'business_license_category',
    },
    colProps: { span: 12, },
  },
  {
    label: '工商营业执照发证机关',
    field: 'issuingAuthority',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '工商营业执照截止日期',
    field: 'businessExpirationDate',
    component: 'Input',
    slot: 'DateSlot',
    colProps: { span: 12, },
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
    colProps: { span: 12, },
  },
  {
    label: '安责险行业',
    field: 'safetyLiability',
    component: 'JDictSelectTag',
    componentProps: ({ formActionType, formModel }) => {
      return {
        dictCode: 'production_operation_mode',
        onChange: e => {
          e ? formModel.isHighRiskIndustry = '1' : formModel.isHighRiskIndustry = undefined
        }
      }
    },
    colProps: { span: 12, },
  },
  {
    label: '职业病危害等级',
    field: 'occupationalDisease',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'occupational_disease',
    },
    colProps: { span: 12, },
  },
  {
    label: '备注',
    field: 'remarks',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }],
    colProps: { span: 24, },
  },
]

// 安全生产基础信息
export const formSchemaSafe: FormSchema[] = [
  {
    label: '主要负责人',
    field: 'chargePerson',
    component: 'Input',
    colProps: { span: 8, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    field: 'chargePersonFixedPhone',
    label: '主要负责人固定电话',
    component: 'Input',
    colProps: { span: 8 },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    field: 'chargePersonMobilePhone',
    label: '主要负责人移动电话',
    component: 'Input',
    colProps: { span: 8 },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    label: '主要负责人电子邮箱',
    field: 'chargePersonMailbox',
    component: 'Input',
    colProps: { span: 8, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '安全负责人',
    field: 'safetyManager',
    component: 'Input',
    colProps: { span: 8, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    field: 'safetyManagerFixedPhone',
    label: '安全负责人固定电话',
    component: 'Input',
    colProps: { span: 8 },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    field: 'safetyManagerMobilePhone',
    label: '安全负责人移动电话',
    component: 'Input',
    colProps: { span: 8 },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    label: '安全负责人电子邮箱',
    field: 'safetyManagerMailbox',
    component: 'Input',
    colProps: { span: 8, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '是否有专职安全人员',
    field: 'isDedicatedSafetyPersonnel',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
    colProps: { span: 8 }
  },
  {
    label: '生产经营地址',
    field: 'productionOperationAddress',
    component: 'Input',
    colProps: { span: 16, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '从业人员数量',
    field: 'employeesNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '大专以上学历人员数量',
    field: 'degreeAboveNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '特种作业人员数量',
    field: 'specialOperationNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '专职安全生产管理人员数量',
    field: 'zzSafetyProductionNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '兼职安全生产管理人员数量',
    field: 'jzSafetyProductionNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '专职应急管理人员数量',
    field: 'zzEmergencyNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '注册安全工程师人员数量',
    field: 'registeredSafetyEngineerNum',
    component: 'InputNumber',
    colProps: { span: 8, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '规模情况',
    field: 'scaleSituation',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    colProps: { span: 12, },
  },
  {
    label: '企业规模',
    field: 'enterpriseSize',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' }],
  },
  {
    label: '安全部门负责人',
    field: 'securityDepartHead',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '安全部门负责人移动电话',
    field: 'securityDepartHeadPhone',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    label: '监管分类',
    field: 'regulatoryClassification',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '属地安监机构',
    field: 'safetySupervisionInstitutions',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '应急救援队伍情况',
    field: 'emergencyRescueTeam',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'emergency_rescue_team',
    },
    colProps: { span: 12, },
  },
  {
    label: '是否存在重大危险源',
    field: 'isMajorHazardSource',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
    colProps: { span: 12, },
  },
  {
    label: '职业病累计人数',
    field: 'occupationalDiseasesNum',
    component: 'InputNumber',
    colProps: { span: 12, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '风险辨识等级',
    field: 'riskIdentificationLevel',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'risk_identification_level',
    },
    colProps: { span: 12, },
  },
  {
    label: '诚信等级',
    field: 'integrityLevel',
    component: 'JDictSelectTag',
    componentProps: ({ formActionType, formModel }) => {
      return {
        dictCode: 'integrity_level',
        onChange: e => {
          const { updateSchema } = formActionType;
          let isShowTrue = !e || e == '4'
          if(isShowTrue){
            formModel.integrityLevelCertificateNum = undefined
            formModel.levelCertificateAuthority = undefined
            formModel.levelCertificateDate = undefined
          }
          updateSchema([{
            field: 'integrityLevelCertificateNum',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }, {
            field: 'levelCertificateAuthority',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }, {
            field: 'levelCertificateDate',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }])
        }
      };
    },
    colProps: { span: 12, },
  },
  {
    label: '诚信等级证书编号',
    field: 'integrityLevelCertificateNum',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '诚信等级证书发证机关',
    field: 'levelCertificateAuthority',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    field: 'levelCertificateDate',
    label: '诚信等级证书截止日期',
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
      disabledDate: (current) => {
        const today = new Date();
        const yesterdayTimestamp = today.getTime() - 24 * 60 * 60 * 1000;
        const currentTimestamp = current.valueOf();
        return currentTimestamp <= yesterdayTimestamp;
      },
      disabled: true
    },
    colProps: { span: 12 },
  },
  {
    label: '标准化等级',
    field: 'standardizationLevel',
    component: 'JDictSelectTag',
    componentProps: ({ formActionType, formModel }) => {
      return {
        dictCode: 'standardization_level',
        onChange: e => {
          const { updateSchema } = formActionType;
          let isShowTrue = !e || e == '4'
          if(isShowTrue){
            formModel.standardizationLevelNum = undefined
            formModel.standardizationLevelAuthority = undefined
            formModel.standardizationLevelFzDate = undefined
            formModel.standardizationLevelJzDate = undefined
          }
          updateSchema([{
            field: 'standardizationLevelNum',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }, {
            field: 'standardizationLevelAuthority',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }, {
            field: 'standardizationLevelFzDate',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }, {
            field: 'standardizationLevelJzDate',
            componentProps:{
              disabled: isShowTrue ? true : false
            }
          }])
        }
      };
    },
    colProps: { span: 12, },
  },
  {
    label: '标准化等级证书编号',
    field: 'standardizationLevelNum',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '标准化等级证书发证机关',
    field: 'standardizationLevelAuthority',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    field: 'standardizationLevelFzDate',
    label: '标准化等级证书发证日期',
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
      disabledDate: (current) => {
        const today = new Date();
        const todayTimestamp = today.getTime();
        const currentTimestamp = current.valueOf();
        return currentTimestamp > todayTimestamp;
      },
      disabled: true
    },
    colProps: { span: 12 },
  },
  {
    field: 'standardizationLevelJzDate',
    label: '标准化等级证书截止日期',
    component: 'DatePicker',
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
      disabledDate: (current) => {
        const today = new Date();
        const yesterdayTimestamp = today.getTime() - 24 * 60 * 60 * 1000;
        const currentTimestamp = current.valueOf();
        return currentTimestamp <= yesterdayTimestamp;
      },
    },
    colProps: { span: 12 },
  },
  {
    label: '安全风险',
    field: 'securityRisks',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'security_risks',
    },
    colProps: { span: 12, },
  },
  {
    label: '是否有专门安全机构',
    field: 'isSpecializedSafetyOrganization',
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        placeholder: '请选择',
        onChange: e => {
          const { updateSchema } = formActionType;
          if(e.target.value === '0'){
            formModel.securityAgencyName = undefined
            formModel.securityAgencyFzr = undefined
            formModel.securityAgencyFzrPhone = undefined
            formModel.securityAgencyNum = undefined
          }
          updateSchema([{
            field: 'securityAgencyName',
            componentProps:{
              disabled: e.target.value === '0' ? true : false
            }
          }, {
            field: 'securityAgencyFzr',
            componentProps:{
              disabled: e.target.value === '0' ? true : false
            }
          }, {
            field: 'securityAgencyFzrPhone',
            componentProps:{
              disabled: e.target.value === '0' ? true : false
            }
          }, {
            field: 'securityAgencyNum',
            componentProps:{
              disabled: e.target.value === '0' ? true : false
            }
          }])
        }
      };
    },
    colProps: { span: 24, },
  },
  {
    label: '安全机构名称',
    field: 'securityAgencyName',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '安全机构负责人',
    field: 'securityAgencyFzr',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
  },
  {
    label: '安全机构负责人电话',
    field: 'securityAgencyFzrPhone',
    component: 'Input',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
  },
  {
    label: '安全机构人数',
    field: 'securityAgencyNum',
    component: 'InputNumber',
    componentProps: {
      disabled: true
    },
    colProps: { span: 12, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '资质证照',  // url
    field: 'qualificationCertificate',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
  },
  {
    label: '是否涉及危险化学品', //  isHazardousChemicalsUrl
    field: 'isHazardousChemicals',
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isHazardousChemicalsUrl = ''
          }
          updateSchema({
            field: 'isHazardousChemicalsUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24, },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isHazardousChemicalsUrl
    field: 'isHazardousChemicalsUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '涉及危化品种类，数量',
    field: 'hazardousChemicalsNum',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    labelWidth:'485px'
  },
  {
    label: '是否有安全生产管理制度',
    field: 'isSafetyProduction',  // isSafetyProductionUrl
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isSafetyProductionUrl = ''
          }
          updateSchema({
            field: 'isSafetyProductionUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isSafetyProductionUrl
    field: 'isSafetyProductionUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '是否有企业文化',
    field: 'isCorporateCulture', //isCorporateCultureUrl
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isCorporateCultureUrl = ''
          }
          updateSchema({
            field: 'isCorporateCultureUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isCorporateCultureUrl
    field: 'isCorporateCultureUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '是否有特种设备',
    field: 'isSpecialEquipment', // isSpecialEquipmentUrl	
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isSpecialEquipmentUrl = ''
          }
          updateSchema({
            field: 'isSpecialEquipmentUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isSpecialEquipmentUrl
    field: 'isSpecialEquipmentUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '企业主要负责人是否已取得相关安全生产考核或培训证件',
    field: 'isFzrZj', // isFzrZjUrl
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isFzrZjUrl = ''
          }
          updateSchema({
            field: 'isFzrZjUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isFzrZjUrl
    field: 'isFzrZjUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '企业安全生产管理人员是否已取得相关安全生产考核或培训证件',
    field: 'isScglrZj', // isScglrZjUrl	
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isScglrZjUrl = ''
          }
          updateSchema({
            field: 'isScglrZjUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isScglrZjUrl
    field: 'isScglrZjUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    colProps: { span: 24 },
  },
  {
    label: '特种作业人员是否已取得相关特种作业证书',
    field: 'isTzztZj',  // isTzztZjUrl
    component: 'RadioGroup',
    componentProps: ({ formActionType, formModel }) => {
      return {
        options: [
          { label: '是', value: '1' },
          { label: '否', value: '0' },
        ],
        onChange: item => {
          const { updateSchema } = formActionType;
          let e = item.target.value
          if(e === '0'){
            formModel.isTzztZjUrl = ''
          }
          updateSchema({
            field: 'isTzztZjUrl',
            componentProps:{
              disabled: e === '0' ? true : false
            }
          })
        }
      }
    },
    colProps: { span: 24 },
    defaultValue: '1',
    labelWidth:'485px'
  },
  {
    label: '', //  isTzztZjUrl
    field: 'isTzztZjUrl',
    component: 'JUpload',
    componentProps: {
      maxCount: 3,
      text:'添加附件',
      // accept: '.pdf,.doc,.docx',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return
        }
        return isLt300M;
        // return new Promise((resolve, reject) => {
        //   const isLt300M = file.size / 1024 / 1024 < 300;
        //   if(!isLt300M) {
        //     createMessage.error('文件过大，===请不要超过300M！');
        //     return reject(false);
        //   }
        //   return resolve(true)
        // })
      },
    },
    colProps: { span: 24 },
  },
]

// 工贸企业基础信息
export const formSchemaTrade: FormSchema[] = [
  {
    label: '企业名称',
    field: 'enterpriseName',
    component: 'Input',
    slot: 'MCSlot',
    colProps: { span: 24, },
  },
  {
    label: '主要生产工艺',
    field: 'productionProcesses',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '主要原材料',
    field: 'rawMaterials',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '主要产品产能',
    field: 'productCapacity',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '主要危险源 (主要安全风险伴随的设施、部位、场所和区域， 以及伴随风险的主要作业活动等)',
    field: 'hazardSources',
    component: 'InputTextArea',
    componentProps: {
      rows: 6,
    },
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '工贸企业重点监管类别',
    field: 'regulatoryCategories',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '生产经营方式',
    field: 'productionOperationMode',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'production_operation_mode',
    },
    colProps: { span: 12, },
  },
  {
    label: '钢铁行业所属流程',
    field: 'processSteelIndustry',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'process_steel_industry',
    },
    colProps: { span: 12, },
  },
  {
    label: '钢铁生产工艺',
    field: 'steelProductionProcess',
    component: 'Input',
    colProps: { span: 12, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '是否有限空间',
    field: 'isLimitedSpace',
    component: 'JDictSelectTag',
    componentProps: ({ formActionType, formModel }) => {
      return {
        dictCode: 'yn',
        onChange: e => {
          formModel.limitedSpaceType = ''
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'limitedSpaceType',
            componentProps: {
              disabled: e === '0' ? true : false
            }
          })
        }
      };
    },
    colProps: { span: 7 }
  },
  {
    label: '有限空间类型',
    field: 'limitedSpaceType',
    component: 'Input',
    colProps: { span: 17, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '有毒有害物质',
    field: 'toxicHarmfulSubstances',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '主要安全风险',
    field: 'mainSafetyRisks',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '涉有限空间场所信息',
    field: 'limitedSpaceLocations',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '有独立污水处理设施的企业分类',
    field: 'independentSewageQyfl',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    colProps: { span: 24, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '是否涉爆粉尘',
    field: 'isExplosiveDust',
    component: 'JDictSelectTag',
    componentProps: ({ formActionType, formModel }) => {
      return {
        dictCode: 'yn',
        onChange: e => {
          formModel.dustName = ''
          const { updateSchema } = formActionType;
          updateSchema({
            field: 'dustName',
            componentProps: {
              disabled: e === '0' ? true : false
            }
          })
        }
      };
    },
    colProps: { span: 7, },
  },
  {
    label: '粉尘名称',
    field: 'dustName',
    component: 'Input',
    colProps: { span: 17, },
    rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
  },
  {
    label: '粉尘作业场所人数',
    field: 'dustZyrs',
    colProps: { span: 24, },
    component: 'InputNumber',
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '涉氨制冷类别',
    field: 'refrigerationCategory',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '主要设备情况',
    field: 'zyDeviceSituation',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '其他设备情况',
    field: 'qtDeviceSituation',
    component: 'Input',
    colProps: { span: 24, },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
  },
  {
    label: '是否构成重大危险源',
    field: 'isGcHazardSource',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'yn',
    },
    colProps: { span: 7, },
  },
  {
    label: '处数',
    field: 'locationsNum',
    component: 'InputNumber',
    colProps: { span: 17, },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '一级危险源处数',
    field: 'oneWxys',
    component: 'InputNumber',
    colProps: { span: 12, },
    componentProps: ({ formActionType, formModel }) => {
      return {
        onChange: e => {
          const { updateSchema } = formActionType;
          !e ? formModel.onSsmc = '' : null
          updateSchema({
            field: 'onSsmc',
            componentProps: {
              disabled: !e ? true : false
            }
          })
        }
      };
    },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '分别说明具体介质、生产（储存）设施名称',
    field: 'onSsmc',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    colProps: { span: 12, },
  },
  {
    label: '二级危险源处数',
    field: 'twoWxys',
    component: 'InputNumber',
    colProps: { span: 12, },
    componentProps: ({ formActionType, formModel }) => {
      return {
        onChange: e => {
          const { updateSchema } = formActionType;
          !e ? formModel.twoSsmc = '' : null
          updateSchema({
            field: 'twoSsmc',
            componentProps: {
              disabled: !e ? true : false
            }
          })
        }
      };
    },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '分别说明具体介质、生产（储存）设施名称',
    field: 'twoSsmc',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    colProps: { span: 12, },
  },
  {
    label: '三级危险源处数',
    field: 'threeWxys',
    component: 'InputNumber',
    colProps: { span: 12, },
    componentProps: ({ formActionType, formModel }) => {
      return {
        onChange: e => {
          const { updateSchema } = formActionType;
          !e ? formModel.threeSsmc = '' : null
          updateSchema({
            field: 'threeSsmc',
            componentProps: {
              disabled: !e ? true : false
            }
          })
        }
      };
    },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '分别说明具体介质、生产（储存）设施名称',
    field: 'threeSsmc',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    colProps: { span: 12, },
  },
  {
    label: '四级危险源处数',
    field: 'fourWxys',
    component: 'InputNumber',
    colProps: { span: 12, },
    componentProps: ({ formActionType, formModel }) => {
      return {
        onChange: e => {
          const { updateSchema } = formActionType;
          !e ? formModel.fourSsmc = '' : null
          updateSchema({
            field: 'fourSsmc',
            componentProps: {
              disabled: !e ? true : false
            }
          })
        }
      };
    },
    rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
  },
  {
    label: '分别说明具体介质、生产（储存）设施名称',
    field: 'fourSsmc',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
    colProps: { span: 12, },
  },
  {
    label: '备注',
    field: 'remarks',
    component: 'InputTextArea',
    componentProps: {
      rows: 3,
    },
    rules: [{ min: 0, max: 500, message: '长度不能超过 500 个字符', trigger: 'blur' }],
    colProps: { span: 24, },
  },
]
