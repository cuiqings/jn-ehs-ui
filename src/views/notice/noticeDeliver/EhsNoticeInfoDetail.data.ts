import {FormSchema} from '/@/components/Table';
//import {rules} from '/@/utils/helper/validator';
//表单数据
export const formSchema: FormSchema[] = [
  {
    field: 'orgCode',
    component: 'ETreeSelectOrg',
    label: '签发单位',
    componentProps: {
    },
    colProps: {
      span: 12,
    },
    ifShow: ({ values }) => {
        if(values.isOther == '1'){
          return false;
        }else{
          return true;
        }
    },
  },
  {
    label: '签发单位',
    field: 'orgName',
    component: 'Input',
    required: true,
    colProps: {
      span: 12,
    },
    ifShow: ({ values }) => {
      if(values.isOther == '1'){
        return true;
      }else{
        return false;
      }
    },
  },
  {
    field: 'isOther',
    component: 'JCheckbox',
    label: '其他:',
    defaultValue: '0',
    componentProps: {
      options: [
        { label: '', value: '1' },
      ],
    },
    colProps: {
      span: 12,
    },
  },
  // {
  //   label: '通知类型',//1整改通知书2预警通知书3管控通知书4考核通知书5表扬通知书
  //   field: 'type',
  //   component: 'JDictSelectTag',
  //   componentProps: {
  //     dictCode: 'notice_info_type',
  //     placeholder: '请选择',
  //     stringToNumber: false,
  //   },
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '通知书录入',//1在线录入，2附件下发
  //   field: 'entryMethod',
  //   component: 'RadioGroup',
  //   colProps: {
  //     span: 24,
  //   },
  //   componentProps: {
  //     options: [
  //       {
  //         label: '在线录入',
  //         value: '1',
  //       },
  //       {
  //         label: '附件下发',
  //         value: '2',
  //       },
  //     ],
  //   },
  // },

  // {
  //   label: '标题',
  //   field: 'title',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '接收单位ID',
  //   field: 'receiveOrgId',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '接收单位名称',
  //   field: 'receiveOrgName',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '接收人ID',
  //   field: 'receiveUserId',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '接收人名称',
  //   field: 'receiveUserName',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '编号',
  //   field: 'noticeNo',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '整改要求',
  //   field: 'content',
  //   component: 'InputTextArea',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '限定整改日期',
  //   field: 'endDt',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '附件',
  //   field: 'attachment',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // {
  //   label: '状态',//0暂存，1提交，2审核，3签收，4整改，5复查完成
  //   field: 'status',
  //   component: 'Input',
  //   colProps: {
  //     span: 24,
  //   },
  // },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
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
