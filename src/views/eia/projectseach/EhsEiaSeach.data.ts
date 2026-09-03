import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {useMessage} from "/@/hooks/web/useMessage";

const {createMessage} = useMessage();
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '项目名称',
    align: "center",
    dataIndex: 'projectName'
  },
  {
    title: '项目类型',
    align: "center",
    dataIndex: 'type'
  },
  {
    title: '所属机构',
    align: "center",
    dataIndex: 'orgName'
  },
  {
    title: '备案编号',
    align: "center",
    dataIndex: 'filingsNo'
  },
  {
    title: '备案名称',
    align: "center",
    dataIndex: 'filingsName'
  },
  {
    title: '环评报告',
    align: "center",
    dataIndex: 'eiaEndAttachId',
    slots: {customRender: 'eiaEndAttachIdPath'},
  },
  {
    title: '排污许可证',
    align: "center",
    dataIndex: 'pollutionDischargeAttach',
    slots: {customRender: 'pollutionDischargeAttachPath'},
  },
  {
    title: '验收报告',
    align: "center",
    dataIndex: 'acceptanceEndAttachId',
    slots: {customRender: 'acceptanceEndAttachIdPath'},
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '项目名称',
    field: 'projectName',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    label: '项目类型',
    field: 'type',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    field: 'orgCode',
    component: 'ETreeSelectOrg',
    label: '所属机构',
    componentProps: {},
    colProps: {
      span: 6,
    },
  },
  {
    label: '备案编号',
    field: 'filingsNo',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    label: '备案名称',
    field: 'filingsName',
    component: 'Input',
    colProps: {span: 6},
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
    show: false
  },
];


//表单数据
export const formSchemaEdit: FormSchema[] = [
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
  {
    field: 'orgCode',
    component: 'ETreeSelectOrg',
    label: '所属机构',
    componentProps: {},
  },
];

export const applyFormSchema: FormSchema[] = [
  {
    label: '',
    field: 'eiaType',
    component: 'Input',
    show: false
  },
  {
    label: '备案编号',
    field: 'filingsNo',
    component: 'Input',
    ifShow: ({values}) => {
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
    helpMessage: '无限制上传',
    componentProps: {
      biz: 'eia',
      maxCount: 9,
      text: '添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
        }
        return isLt300M;
      },
    },
    label: '备案文件',
    ifShow: ({values}) => {
      if (values.eiaType == '1') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'contractDt',
    label: '合同签订日期',
    component: 'DatePicker',
    componentProps: {
      showTime: true,
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
    },
    ifShow: ({values}) => {
      if (values.eiaType == '2') {
        return true;
      } else {
        return false;
      }
    },
  },
  {
    field: 'contractAttachId',
    component: 'JUpload',
    helpMessage: '无限制上传',
    componentProps: {
      biz: 'eia',
    },
    label: '合同文件',
    ifShow: ({values}) => {
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
    ifShow: ({values}) => {
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
    helpMessage: '无限制上传',
    componentProps: {
      bizPath: 'eia',
    },
    label: '环评提资单文件',
    ifShow: ({values}) => {
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
    component: 'Input',
    ifShow: ({values}) => {
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
    show: false
  },
  {
    label: '',
    field: 'ids',
    component: 'Input',
    show: false
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
