<template>
  <div class="safeInfoForm">
    <!-- 表单 -->
    <a-spin :spinning="loading">
      <BasicForm @register="registerForm" />
    </a-spin>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, onMounted } from 'vue';
  import { safeInfoSave, safeInfoView } from './url/index';
  import { BasicForm, useForm } from '/@/components/Form';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { FormSchema } from '/@/components/Table';
  const props = defineProps({
    companyCode: { type: String, default: '' },
  });
  const emit = defineEmits(['is-edit']);
  const { createMessage } = useMessage();
  const loading = ref<boolean>(false);
  const resData = ref<any>({});
  const formSchemaSafe: FormSchema[] = [
    {
      label: '',
      field: 'id',
      component: 'Input',
      show: false,
    },
    {
      label: '主要负责人',
      field: 'chargePerson',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ required: true, min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
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
      rules: [{ required: true, pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      label: '主要负责人电子邮箱',
      field: 'chargePersonMailbox',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '安全负责人',
      field: 'safetyManager',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ required: true, min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
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
      rules: [{ required: true, pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      label: '安全负责人电子邮箱',
      field: 'safetyManagerMailbox',
      component: 'Input',
      colProps: { span: 8 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '是否有专职安全人员',
      field: 'isDedicatedSafetyPersonnel',
      component: 'JDictSelectTag',
      required: true,
      componentProps: {
        dictCode: 'yn',
      },
      colProps: { span: 8 },
    },
    {
      label: '生产经营地址',
      field: 'productionOperationAddress',
      component: 'Input',
      colProps: { span: 16 },
      rules: [{ required: true, min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '从业人员数量',
      field: 'employeesNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ required: true, pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '大专以上学历人员数量',
      field: 'degreeAboveNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '特种作业人员数量',
      field: 'specialOperationNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '专职安全生产管理人员数量',
      field: 'zzSafetyProductionNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '兼职安全生产管理人员数量',
      field: 'jzSafetyProductionNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '专职应急管理人员数量',
      field: 'zzEmergencyNum',
      component: 'InputNumber',
      colProps: { span: 8 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '注册安全工程师人员数量',
      field: 'registeredSafetyEngineerNum',
      component: 'InputNumber',
      colProps: { span: 8 },
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
      colProps: { span: 12 },
    },
    {
      label: '企业规模',
      field: 'enterpriseSize',
      component: 'InputTextArea',
      componentProps: {
        rows: 3,
      },
      colProps: { span: 12 },
      rules: [{ min: 0, max: 800, message: '长度不能超过 800 个字符', trigger: 'blur' }],
    },
    {
      label: '安全部门负责人',
      field: 'securityDepartHead',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '安全部门负责人移动电话',
      field: 'securityDepartHeadPhone',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      label: '监管分类',
      field: 'regulatoryClassification',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '属地安监机构',
      field: 'safetySupervisionInstitutions',
      component: 'Input',
      colProps: { span: 12 },
      rules: [{ min: 0, max: 100, message: '长度不能超过 100 个字符', trigger: 'blur' }],
    },
    {
      label: '应急救援队伍情况',
      field: 'emergencyRescueTeam',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'emergency_rescue_team',
      },
      colProps: { span: 12 },
    },
    {
      label: '是否存在重大危险源',
      field: 'isMajorHazardSource',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'yn',
      },
      colProps: { span: 12 },
    },
    {
      label: '职业病累计人数',
      field: 'occupationalDiseasesNum',
      component: 'InputNumber',
      colProps: { span: 12 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '风险辨识等级',
      field: 'riskIdentificationLevel',
      component: 'JDictSelectTag',
      componentProps: {
        dictCode: 'risk_identification_level',
      },
      colProps: { span: 12 },
    },
    {
      label: '诚信等级',
      field: 'integrityLevel',
      component: 'JDictSelectTag',
      componentProps: ({ formActionType, formModel }) => {
        return {
          dictCode: 'integrity_level',
          onChange: (e) => {
            const { updateSchema } = formActionType;
            let isShowTrue = !e || e == '4';
            if (isShowTrue) {
              formModel.integrityLevelCertificateNum = undefined;
              formModel.levelCertificateAuthority = undefined;
              formModel.levelCertificateDate = undefined;
            }
            updateSchema([
              {
                field: 'integrityLevelCertificateNum',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
              {
                field: 'levelCertificateAuthority',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
              {
                field: 'levelCertificateDate',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
            ]);
          },
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '诚信等级证书编号',
      field: 'integrityLevelCertificateNum',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '诚信等级证书发证机关',
      field: 'levelCertificateAuthority',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
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
        disabled: true,
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
          onChange: (e) => {
            const { updateSchema } = formActionType;
            let isShowTrue = !e || e == '4';
            if (isShowTrue) {
              formModel.standardizationLevelNum = undefined;
              formModel.standardizationLevelAuthority = undefined;
              formModel.standardizationLevelFzDate = undefined;
              formModel.standardizationLevelJzDate = undefined;
            }
            updateSchema([
              {
                field: 'standardizationLevelNum',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
              {
                field: 'standardizationLevelAuthority',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
              {
                field: 'standardizationLevelFzDate',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
              {
                field: 'standardizationLevelJzDate',
                componentProps: {
                  disabled: isShowTrue ? true : false,
                },
              },
            ]);
          },
        };
      },
      colProps: { span: 12 },
    },
    {
      label: '标准化等级证书编号',
      field: 'standardizationLevelNum',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '标准化等级证书发证机关',
      field: 'standardizationLevelAuthority',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
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
        disabled: true,
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
      colProps: { span: 12 },
    },
    {
      label: '是否有专门安全机构',
      field: 'isSpecializedSafetyOrganization',
      component: 'RadioGroup',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          placeholder: '请选择',
          onChange: (e) => {
            const { updateSchema } = formActionType;
            if (e.target.value === '0') {
              formModel.securityAgencyName = undefined;
              formModel.securityAgencyFzr = undefined;
              formModel.securityAgencyFzrPhone = undefined;
              formModel.securityAgencyNum = undefined;
            }
            updateSchema([
              {
                field: 'securityAgencyName',
                componentProps: {
                  disabled: e.target.value === '0' ? true : false,
                },
              },
              {
                field: 'securityAgencyFzr',
                componentProps: {
                  disabled: e.target.value === '0' ? true : false,
                },
              },
              {
                field: 'securityAgencyFzrPhone',
                componentProps: {
                  disabled: e.target.value === '0' ? true : false,
                },
              },
              {
                field: 'securityAgencyNum',
                componentProps: {
                  disabled: e.target.value === '0' ? true : false,
                },
              },
            ]);
          },
        };
      },
      colProps: { span: 24 },
    },
    {
      label: '安全机构名称',
      field: 'securityAgencyName',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '安全机构负责人',
      field: 'securityAgencyFzr',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ min: 0, max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }],
    },
    {
      label: '安全机构负责人电话',
      field: 'securityAgencyFzrPhone',
      component: 'Input',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ pattern: /^[0-9()（）-]{1,20}$/, message: '请输入正确的联系方式！' }],
    },
    {
      label: '安全机构人数',
      field: 'securityAgencyNum',
      component: 'InputNumber',
      componentProps: {
        disabled: true,
      },
      colProps: { span: 12 },
      rules: [{ pattern: /^\d{1,6}$/, message: '输入正确数字，且长度不能超过 6 位' }],
    },
    {
      label: '资质证照', // url
      field: 'qualificationCertificate',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      label: '是否涉及危险化学品', //  isHazardousChemicalsUrl
      field: 'isHazardousChemicals',
      component: 'RadioGroup',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isHazardousChemicalsUrl = '';
            }
            updateSchema({
              field: 'isHazardousChemicalsUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isHazardousChemicalsUrl
      field: 'isHazardousChemicalsUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      colProps: { span: 24 },
      rules: [{ min: 0, max: 300, message: '长度不能超过 300 个字符', trigger: 'blur' }],
      labelWidth: '485px',
    },
    {
      label: '是否有安全生产管理制度',
      field: 'isSafetyProduction', // isSafetyProductionUrl
      component: 'RadioGroup',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isSafetyProductionUrl = '';
            }
            updateSchema({
              field: 'isSafetyProductionUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isSafetyProductionUrl
      field: 'isSafetyProductionUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isCorporateCultureUrl = '';
            }
            updateSchema({
              field: 'isCorporateCultureUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isCorporateCultureUrl
      field: 'isCorporateCultureUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isSpecialEquipmentUrl = '';
            }
            updateSchema({
              field: 'isSpecialEquipmentUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isSpecialEquipmentUrl
      field: 'isSpecialEquipmentUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isFzrZjUrl = '';
            }
            updateSchema({
              field: 'isFzrZjUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isFzrZjUrl
      field: 'isFzrZjUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isScglrZjUrl = '';
            }
            updateSchema({
              field: 'isScglrZjUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '', //  isScglrZjUrl
      field: 'isScglrZjUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
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
      field: 'isTzztZj', // isTzztZjUrl
      component: 'RadioGroup',
      required: true,
      componentProps: ({ formActionType, formModel }) => {
        return {
          options: [
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ],
          onChange: (item) => {
            const { updateSchema } = formActionType;
            let e = item.target.value;
            if (e === '0') {
              formModel.isTzztZjUrl = '';
            }
            updateSchema({
              field: 'isTzztZjUrl',
              componentProps: {
                disabled: e === '0' ? true : false,
              },
            });
          },
        };
      },
      colProps: { span: 24 },
      defaultValue: '1',
      labelWidth: '485px',
    },
    {
      label: '',
      field: 'isTzztZjUrl',
      component: 'JUpload',
      componentProps: {
        maxCount: 3,
        text: '添加附件',
        beforeUpload: (file: File) => {
          const isLt300M = file.size / 1024 / 1024 < 300;
          if (!isLt300M) {
            createMessage.error('文件过大，请不要超过300M！');
            return;
          }
          return isLt300M;
        },
      },
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
    if (resData.value) {
      const isTureInter = !resData.value.integrityLevel || resData.value.integrityLevel == '4';
      const isTureStandar = !resData.value.standardizationLevel || resData.value.standardizationLevel == '4';
      updateSchema([
        {
          field: 'integrityLevelCertificateNum',
          componentProps: {
            disabled: isTureInter ? true : false,
          },
        },
        {
          field: 'levelCertificateAuthority',
          componentProps: {
            disabled: isTureInter ? true : false,
          },
        },
        {
          field: 'levelCertificateDate',
          componentProps: {
            disabled: isTureInter ? true : false,
          },
        },
        {
          field: 'standardizationLevelNum',
          componentProps: {
            disabled: isTureStandar ? true : false,
          },
        },
        {
          field: 'standardizationLevelAuthority',
          componentProps: {
            disabled: isTureStandar ? true : false,
          },
        },
        {
          field: 'standardizationLevelFzDate',
          componentProps: {
            disabled: isTureStandar ? true : false,
          },
        },
        {
          field: 'standardizationLevelJzDate',
          componentProps: {
            disabled: isTureStandar ? true : false,
          },
        },
        {
          field: 'securityAgencyName',
          componentProps: {
            disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false,
          },
        },
        {
          field: 'securityAgencyFzr',
          componentProps: {
            disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false,
          },
        },
        {
          field: 'securityAgencyFzrPhone',
          componentProps: {
            disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false,
          },
        },
        {
          field: 'securityAgencyNum',
          componentProps: {
            disabled: resData.value.isSpecializedSafetyOrganization === '0' ? true : false,
          },
        },

        {
          field: 'isHazardousChemicalsUrl',
          componentProps: {
            disabled: resData.value.isHazardousChemicals === '0' ? true : false,
          },
        },
        {
          field: 'isSafetyProductionUrl',
          componentProps: {
            disabled: resData.value.isSafetyProduction === '0' ? true : false,
          },
        },
        {
          field: 'isCorporateCultureUrl',
          componentProps: {
            disabled: resData.value.isCorporateCulture === '0' ? true : false,
          },
        },
        {
          field: 'isSpecialEquipmentUrl',
          componentProps: {
            disabled: resData.value.isSpecialEquipment === '0' ? true : false,
          },
        },
        {
          field: 'isFzrZjUrl',
          componentProps: {
            disabled: resData.value.isFzrZj === '0' ? true : false,
          },
        },
        {
          field: 'isScglrZjUrl',
          componentProps: {
            disabled: resData.value.isScglrZj === '0' ? true : false,
          },
        },
        {
          field: 'isTzztZjUrl',
          componentProps: {
            disabled: resData.value.isTzztZj === '0' ? true : false,
          },
        },
      ]);
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
    const res = await safeInfoSave(values);
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
      const { success, result } = await safeInfoView({ dataOrgCode: props.companyCode });
      if (success) {
        if (!result) {
          resetFields();
        } else {
          result.employeesNum = Number(result.employeesNum);
          resData.value = result;
          setFieldsValue({ ...result });
        }
      } else {
        resData.value = {};
        resetFields();
      }
    } finally {
      setProps({ disabled: true });
      loading.value = false;
    }
  };

  // 注册Form ======
  const [registerForm, { setProps, resetFields, setFieldsValue, validate, updateSchema }] = useForm({
    labelWidth: 220,
    labelAlign: 'left',
    schemas: formSchemaSafe,
    showActionButtonGroup: false,
    compact: true,
    size: 'large',
  });
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
  .safeInfoForm {
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
        label[title='规模情况'],
        [title='企业规模'],
        [title='涉及危化品种类，数量'] {
          min-height: 85px;
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
