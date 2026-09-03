import { BasicColumn } from '/@/components/Table';
import { FormSchema } from '/@/components/Table';
import { rules } from '/@/utils/helper/validator';
import { ref } from 'vue';
import { defHttp } from '/@/utils/http/axios';
import { message, Upload } from 'ant-design-vue';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '所属机构',
    align: 'center',
    dataIndex: 'orgName',
  },
  {
    title: '项目名称',
    align: 'center',
    dataIndex: 'projectName',
  },
  {
    title: '计划开工时间',
    align: 'center',
    dataIndex: 'startDt',
  },
  {
    title: '计划完工时间',
    align: 'center',
    dataIndex: 'endDt',
  },
  {
    title: '项目类型',
    align: 'center',
    dataIndex: 'type',
  },
  {
    title: '所属部门',
    align: 'center',
    dataIndex: 'oaOrgName',
  },
  {
    title: '申请人',
    align: 'center',
    dataIndex: 'applicantName',
  },
  {
    title: '申请日期',
    align: 'center',
    dataIndex: 'applicantDt',
  },
  {
    title: '联系电话',
    align: 'center',
    dataIndex: 'phone',
  },
  {
    title: '备案编号',
    align: 'center',
    dataIndex: 'filingsNo',
  },
  {
    title: '备案名称',
    align: 'center',
    dataIndex: 'filingsName',
  },
  {
    title: '项目状态', //1审批中2审批通过3已备案4合同已签订5已关闭6环评中7环评完成8验收中9验收完成
    align: 'center',
    dataIndex: 'status_dictText',
  },
  {
    title: '排污许可状态', //0未申请 1申请 2许可证上传完成
    align: 'center',
    dataIndex: 'pollutionDischargeStatus_dictText',
  },
];
//查询数据

const orgOptions: any = ref([]);
getOrgList();

function getOrgList() {
  orgOptions.value = [];
  defHttp.get({ url: '/jn/common/getOrganizationNew' }).then((res) => {
    res.map((item: any) => {
      orgOptions.value.push({
        label: item.departName,
        value: item.orgCode,
      });
    });
  });
}

export const searchFormSchema: FormSchema[] = [
  {
    label: '项目名称',
    field: 'projectName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '项目类型',
    field: 'type',
    component: 'Input',
    colProps: { span: 6 },
  },
  // {
  //   field: 'orgCode',
  //   component: 'ETreeSelectOrg',
  //   label: '所属机构',
  //   componentProps: {
  //   },
  //   colProps: {
  //     span: 6,
  //   },
  // },
  {
    label: '所属机构',
    field: 'orgCode',
    component: 'Select',
    componentProps: ({ formActionType }) => {
      const { setFieldsValue } = formActionType;
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
        });
      }
      return {
        options: orgOptions.value,
        placeholder: '请选择',
        disabled: orgOptions.value.length === 1,
        onChange: (e: any) => {
          setFieldsValue({
            orgCode: undefined,
          });
        },
      };
    },
    colProps: { span: 6 },
  },
  {
    label: '所属部门',
    field: 'oaOrgName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '申请人',
    field: 'applicantName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '联系电话',
    field: 'phone',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '备案编号',
    field: 'filingsNo',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '备案名称',
    field: 'filingsName',
    component: 'Input',
    colProps: { span: 6 },
  },
  {
    label: '项目状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'eia-info-status',
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
  {
    label: '计划开工时间',
    field: 'startDt1',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    label: '计划完工时间',
    field: 'endDt1',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '批次ID',
    field: 'applyId',
    component: 'Input',
  },
  {
    label: '项目名称',
    field: 'projectName',
    component: 'Input',
  },
  {
    label: '所属机构ID',
    field: 'orgId',
    component: 'Input',
  },
  {
    label: '所属机构名称',
    field: 'orgName',
    component: 'Input',
  },
  {
    label: '项目类型',
    field: 'type',
    component: 'Input',
  },
  {
    label: '申请人ID',
    field: 'applicantId',
    component: 'Input',
  },
  {
    label: '申请人名称',
    field: 'applicantName',
    component: 'Input',
  },
  {
    label: '申请日期',
    field: 'applicantDt',
    component: 'Input',
  },
  {
    label: '联系电话',
    field: 'phone',
    component: 'Input',
  },
  {
    label: '合同信息',
    field: 'contractInfo',
    component: 'Input',
  },
  {
    label: '合同签订日期',
    field: 'contractDt',
    component: 'Input',
  },
  {
    label: '合同附件ID',
    field: 'contractAttachId',
    component: 'Input',
  },
  {
    label: '备案编号',
    field: 'filingsNo',
    component: 'Input',
  },
  {
    label: '备案附件ID',
    field: 'filingsAttachId',
    component: 'Input',
  },
  {
    label: '计划开工时间',
    field: 'startDt',
    component: 'Input',
  },
  {
    label: '计划完工时间',
    field: 'endDt',
    component: 'Input',
  },
  {
    label: '状态：1审批中2审批通过3已备案4合同已签订5已关闭6环评中7环评完成8验收中9验收完成',
    field: 'status',
    component: 'Input',
  },
  {
    label: '环评提资项目名称',
    field: 'eiaProjectName',
    component: 'Input',
  },
  {
    label: '环评提资单附件ID',
    field: 'eiaAttachId',
    component: 'Input',
  },
  {
    label: '排污申请人ID',
    field: 'pollutionDischargeUserId',
    component: 'Input',
  },
  {
    label: '排污申请人名称',
    field: 'pollutionDischargeUserName',
    component: 'Input',
  },
  {
    label: '排污申请状态',
    field: 'pollutionDischargeStatus',
    component: 'Input',
  },
  {
    label: '排污申请时间',
    field: 'pollutionDischargeDt',
    component: 'Input',
  },
  {
    label: '验收申请人ID',
    field: 'acceptanceCheckUserId',
    component: 'Input',
  },
  {
    label: '验收申请人名称',
    field: 'acceptanceCheckUserName',
    component: 'Input',
  },
  {
    label: '验收申请状态',
    field: 'acceptanceCheckStatus',
    component: 'Input',
  },
  {
    label: '验收申请时间',
    field: 'acceptanceCheckDt',
    component: 'Input',
  },
  {
    label: '关闭申请人ID',
    field: 'closeUserId',
    component: 'Input',
  },
  {
    label: '关闭申请人名称',
    field: 'closeUserName',
    component: 'Input',
  },
  {
    label: '关闭申请时间',
    field: 'closeDt',
    component: 'Input',
  },
  {
    label: '关闭原因',
    field: 'closeReason',
    component: 'Input',
  },
  {
    label: '是否删除1是0否',
    field: 'isDel',
    component: 'InputNumber',
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
];

//表单数据
export const formSchemaEdit: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  // {
  //   field: 'orgCode',
  //   component: 'ETreeSelectOrg',
  //   label: '所属机构',
  //   componentProps: {
  //   },
  // },
  {
    label: '所属机构',
    field: 'orgCode',
    component: 'Select',
    componentProps: ({ formActionType }) => {
      const { setFieldsValue } = formActionType;
      if (orgOptions.value.length === 1) {
        setFieldsValue({
          orgCode: orgOptions.value[0]?.value,
          // orgName: orgOptions.value[0]?.value,
        });
      }
      return {
        options: orgOptions.value,
        placeholder: '请选择',
        disabled: orgOptions.value.length === 1,
        onChange: (e: any, v) => {
          if (v.label != undefined && e != undefined) {
            setFieldsValue({
              orgCode: e,
              orgName: v.label,
            });
          } else {
            setFieldsValue({
              orgCode: undefined,
              orgName: undefined,
            });
          }
        },
      };
    },
  },
  {
    label: '',
    field: 'orgName',
    component: 'Input',
    show: false,
  },
];

export const applyFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'eiaType',
    component: 'Input',
    show: false,
  },
  {
    label: '备案编号',
    field: 'filingsNo',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 50,
    },
    ifShow: ({ values }) => {
      if (values.eiaType == '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    label: '备案名称',
    field: 'filingsName',
    component: 'Input',
    required: true,
    componentProps: {
      maxlength: 100,
    },
    ifShow: ({ values }) => {
      if (values.eiaType == '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'filingsAttachId',
    component: 'JUpload',
    helpMessage: '文件大小不超过300M！仅支持doc、docx、pdf格式!推荐pdf格式上传！',
    componentProps: {
      biz: 'eia',
      maxCount: 3,
      text: '添加附件',
      beforeUpload: (file: File) => {
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          message.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        } else if (!isPdf && !isDoc && !isDocx) {
          message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
    label: '备案文件',
    ifShow: ({ values }) => {
      if (values.eiaType == '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'contractAttachId',
    component: 'JUpload',
    helpMessage: '文件大小不超过300M！仅支持doc、docx、pdf格式!推荐pdf格式上传！',
    required: true,
    componentProps: {
      biz: 'eia',
      maxCount: 3,
      text: '添加附件',
      beforeUpload: (file: File) => {
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          message.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        } else if (!isPdf && !isDoc && !isDocx) {
          message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
    label: '合同文件',
    ifShow: ({ values }) => {
      if (values.eiaType == '2') {
        return true;
      } else {
        return false;
      }
    },
    dynamicRules: ({ values }) => {
      //需要return
      return [
        {
          //默认开启表单检验
          required: true,
          // value 当前手机号输入的值
          validator: (_, value) => {
            //需要return 一个Promise对象
            return new Promise((resolve, reject) => {
              if (!value) {
                reject('请上传合同文件！');
              }
              resolve();
            });
          },
        },
      ];
    },
  },
  {
    field: 'contractDt',
    label: '合同签订日期',
    component: 'DatePicker',
    defaultValue: new Date(),
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
    },
    ifShow: ({ values }) => {
      if (values.eiaType == '2') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    label: '环评提资项目名称',
    field: 'eiaProjectName',
    component: 'Input',
    required: true,
    dynamicRules: ({ model, schema }) => {
      return [{ ...rules.duplicateCheckRuleByMsg('ehs_eia_info', 'eia_project_name', model, schema, '已有同名环评项目，请重新命名！', true)[0] }];
    },
    componentProps: {
      maxlength: 100,
    },
    ifShow: ({ values }) => {
      if (values.eiaType == '3') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'eiaAttachId',
    component: 'JUpload',
    helpMessage: '文件大小不超过300M！仅支持doc、docx、pdf格式!推荐pdf格式上传！',
    componentProps: {
      bizPath: 'eia',
      maxCount: 1,
      text: '添加附件',
      beforeUpload: (file: File) => {
        const isPdf = file.type === 'application/pdf';
        const isDoc = file.type === 'application/msword';
        const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          message.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        } else if (!isPdf && !isDoc && !isDocx) {
          message.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
          return false || Upload.LIST_IGNORE;
        }
        return true;
      },
    },
    label: '环评提资单文件',
    ifShow: ({ values }) => {
      if (values.eiaType == '3') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'eiaExpirationDt',
    label: '截止时间',
    component: 'DatePicker',
    required: true,
    defaultValue: new Date(),
    componentProps: {
      showTime: false,
      valueFormat: 'YYYY-MM-DD',
      disabledDate: (current) => {
        const today = new Date();
        // 将当前日期转换为时间戳
        const todayTimestamp = today.getTime();
        // 将当前日期之前的日期转换为时间戳
        const currentTimestamp = current.valueOf();
        // 判断当前日期是否在当前日期之前
        return currentTimestamp < todayTimestamp;
      },
    },
    ifShow: ({ values }) => {
      if (values.eiaType == '3') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    label: '关闭原因',
    field: 'closeReason',
    required: true,
    component: 'Input',
    ifShow: ({ values }) => {
      if (values.eiaType == '6') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false,
  },
  {
    label: '',
    field: 'ids',
    component: 'Input',
    show: false,
  },
];

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
