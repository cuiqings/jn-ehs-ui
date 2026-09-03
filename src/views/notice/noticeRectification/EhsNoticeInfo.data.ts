import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {duplicateCheck} from "/@/views/system/user/user.api";
import dayjs, { Dayjs } from 'dayjs';
//列表数据
export const columns: BasicColumn[] = [
  {
    title: '通知类型',//1整改通知书2预警通知书3管控通知书4考核通知书5表扬通知书
    align: "center",
    dataIndex: 'type',
    customRender: ({ text }) => {
      return render.renderDict(text, 'notice_info_type');
    },
  },
  {
    title: '编号',
    align: "center",
    dataIndex: 'noticeNo',
    slots: { customRender: 'viewModal' },
  },
  {
    title: '签发单位',
    align: "center",
    dataIndex: 'orgName'
  },
  {
    title: '整改期限',
    width: 160,
    dataIndex: 'endDt',
    slots: { customRender : 'endDt'}
  },
  {
    title: '整改责任人',
    align: "center",
    dataIndex: 'correctorName',
  },
  {
    title: '整改反馈',
    align: "center",
    dataIndex: 'correctionInfo',
    customRender: ({record}) => {
      let correctionFeedback = "";
      if (record.correctionInfo != null){
        record.correctionInfo.forEach((item,index)=>{
          correctionFeedback += `第${index+1}次整改反馈:${item.correctionFeedback}\n`;
        });
      }
      return correctionFeedback;
    },
    ellipsis:true,
  },
  {
    title: '是否延期',
    align: "center",
    dataIndex: 'isExtension',//1-是，0-否，3-否(申请中)
    customRender: ({ text }) => {
      return render.renderDict(text, 'is_extension');
    },
  },
  {
    title: '状态',//0暂存，1提交，2审核，3签收，4整改，5复查完成
    align: "center",
    dataIndex: 'status',
    customRender: ({ record }) => {
      return getStatus(record);
    },
  },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '通知类型',
    field: 'type',
    component: 'JSelectMultiple',
    componentProps: {
      dictCode: 'notice_info_type',
      placeholder: '请选择',
      stringToNumber: false,
    },
    colProps: { span: 6 },
  },
  {
    field: 'noticeNo',
    label: '编号',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    field: 'orgName',
    label: '签发单位',
    component: 'Input',
    colProps: {span: 6},
  },
  {
    label: '签发时间',
    field: 'createTime1',
    component: 'RangePicker',
    componentProps: {
      valueFormat: 'YYYY-MM-DD',
    },
    colProps: { span: 6 },
  },
  {
    label: '是否延期',
    field: 'isExtension',
    component: 'JDictSelectTag',
    componentProps: {
      placeholder: '请选择',
      stringToNumber: false,
      showChooseOption: false,
      options: [
        {
          label: '是',
          value: '1'
        },
        {
          label: '否',
          value: '0',
        },
      ],
    },
    colProps: { span: 6 },
  },
  {
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      placeholder: '请选择',
      options: [
        {
          label: '整改中',
          value: '3'
        },
        {
          label: '待复查',
          value: '4',
        },
        {
          label: '已完成',
          value: '5',
        },
      ],
      showChooseOption: false,
    },
    colProps: { span: 6 },
  },
];

//延期申请
export const formExtension: formExtension[]=[
  {
    field: 'id',
    label: 'Id',
    component: 'Input',
    colProps: {span: 24},
    show: false
  },
  {
    field: 'endDt',
    label: '限定整改日期',
    component: 'Input',
    colProps: {span: 24},
    dynamicDisabled: true,
    componentProps: {
      bordered: false,
      allowClear: false,
    }
  },
  {
    field: 'extensionTime',
    label: '延期日期',
    component: 'DatePicker',
    colProps: {span: 24},
    rules: [{ required: true, message: '请选择延期日期！'}],
    componentProps(model){
      return{
        allowClear: false,
        disabledDate: (current: Dayjs)=>{
          const endDt = dayjs(model.formModel.endDt);
          return endDt && current < endDt.endOf('day');
        }
      }
    }
  },
  {
    field: 'reson',
    label: '延期原因',
    component: 'InputTextArea',
    colProps: {span: 24},
    componentProps: {
      maxlength: 100,
      showCount: true,
      autoSize: { minRows: 3, maxRows: 5 }
    },
    dynamicRules: ({ values }) => {
      return [
        { required: true, message: '请填写延期原因！' },
        { min: 0, max: 100, message: '请输入100字内的延期原因！', trigger: 'blur' },
      ];
    },
  },
];
//延期审核
export const formExtensionAgree: formExtensionAgree[]=[
  {
    field: 'id',
    label: 'Id',
    component: 'Input',
    colProps: {span: 24},
    show: false
  },
  {
    field: 'extensionOrgName',
    label: '申请单位',
    component: 'Input',
    colProps: {span: 12},
    dynamicDisabled: true,
    componentProps: {
      bordered: false,
      allowClear: false
    }
  },
  {
    field: 'extensionTime',
    label: '申请延期至',
    component: 'Input',
    colProps: {span: 12},
    dynamicDisabled: true,
    componentProps: {
      bordered: false,
      allowClear: false
    },
  },
  {
    field: 'reson',
    label: '延期原因',
    component: 'InputTextArea',
    colProps: {span: 24},
    dynamicDisabled: true,
    componentProps: {
      style: "color: black",
      bordered: false,
      allowClear: false,
      autoSize: true,
    }
  },
  {
    field: 'passTime',
    label: '同意延期至',
    component: 'DatePicker',
    colProps: {span: 24},
    rules: [{ required: true, message: '请选择延期日期！'}],
    componentProps(model){
      return{
        allowClear: false,
      }
    }
  },
  {
    field: 'auditStatement',
    label: '审核说明',
    component: 'InputTextArea',
    colProps: {span: 24},
    componentProps: {
      maxlength: 100,
      showCount: true,
      autoSize: { minRows: 3, maxRows: 5 }
    },
    dynamicRules: ({ values }) => {
      return [
        { required: true, message: '请填写审核说明！' },
        { min: 0, max: 100, message: '请输入100字内的审核说明！', trigger: 'blur' },
      ];
    },
  },
];

//表单数据
export const formSchema: FormSchema[] = [
  {
    label: '签发单位ID',
    field: 'orgId',
    component: 'Input',
  },
  {
    label: '签发单位名称',
    field: 'orgName',
    component: 'Input',
  },
  {
    label: '通知书类型',//1整改通知书2预警通知书3管控通知书4考核通知书5表扬通知书
    field: 'type',
    component: 'Input',
  },
  {
    label: '通知书录入方式',//1在线录入，2附件下发
    field: 'entryMethod',
    component: 'Input',
  },
  {
    label: '标题',
    field: 'title',
    component: 'Input',
  },
  {
    label: '接收单位ID',
    field: 'receiveOrgId',
    component: 'Input',
  },
  {
    label: '接收单位名称',
    field: 'receiveOrgName',
    component: 'Input',
  },
  {
    label: '接收人ID',
    field: 'receiveUserId',
    component: 'Input',
  },
  {
    label: '接收人名称',
    field: 'receiveUserName',
    component: 'Input',
  },
  {
    label: '编号',
    field: 'noticeNo',
    component: 'Input',
  },
  {
    label: '整改要求',
    field: 'content',
    component: 'InputTextArea',
  },
  {
    label: '限定整改日期',
    field: 'endDt',
    component: 'Input',
  },
  {
    label: '附件',
    field: 'attachment',
    component: 'Input',
  },
  {
    label: '状态',//0暂存，1提交，2审核，3签收，4整改，5复查完成
    field: 'status',
    component: 'Input',
  },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];

function getStatus(record){
  let  options =  [{label: '整改中', value: '3',},{label: '待复查',value: '4',},{label: '已完成',value: '5',}];
  let label = '';
  let obj = options.filter((item) => {
    if(item.value == record.status){
      label =  item.label;
      return label;
    }
  });
  return label;
}

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
