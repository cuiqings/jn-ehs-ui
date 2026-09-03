import {BasicColumn} from '/@/components/Table';
import {FormSchema} from '/@/components/Table';
import {rules} from '/@/utils/helper/validator';
import {render} from '/@/utils/common/renderUtils';
import {ref, computed, unref} from 'vue';
// import {useUserStore} from '/@/store/modules/user';
// const userStore = useUserStore();

// const loginInfo = computed(() => userStore.getLoginInfo);

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
    slots: { customRender: 'clickNoticeNo' },
  },
  {
    title: '签发单位',
    align: "center",
    dataIndex: 'orgName'
  },
  {
    title: '接收单位',
    align: "center",
    dataIndex: 'receiveDisplayName',
    width: 200,
  },
  {
    title: '签发时间',
    width: 160,
    dataIndex: 'distributeTime',
    customRender: ({ record }) => {
      return getTime(record);
    },
  },
  {
    title: '签收时间',
    width: 160,
    dataIndex: 'receiveTime',
    customRender: ({ record }) => {
      return getSignTime(record);
    },
  },
  {
    title: '签收人',
    align: "center",
    dataIndex: 'correctorName',
    customRender: ({ record }) => {
      return getCreater(record);
    },
  },
  {
    title: '状态',//0暂存，1提交，2审核，3签收，4整改，5复查完成
    align: "center",
    dataIndex: 'status',
    customRender: ({ record }) => {
      return getStatus(record);
      // return render.renderDict(text, 'notice_info_status');
    },
  },
  // {
  //   title: '签收进度',//0暂存，1提交，2审核，3签收，4整改，5复查完成
  //   align: "center",
  //   dataIndex: 'status',
  //   customRender: ({ text }) => {
  //     if(text>2){
  //       return "已签收";
  //     }else{
  //       return "--";
  //     }
  //   },
  // },
];
//查询数据
export const searchFormSchema: FormSchema[] = [
  {
    label: '通知类型',
    field: 'type',
    component: 'JSelectMultiple',
    componentProps: {
      dictCode: 'notice_info_type',
      
      stringToNumber: false,
      showChooseOption: false,
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
  // {
  //   field: 'receiveOrgId',
  //   label: '接收单位id',
  //   component: 'Input',
  //   show: false,
  //   defaultValue : getOrgId()
  // },
  {
    field: 'receiveOrgName',
    label: '接收单位',
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
    label: '状态',
    field: 'status',
    component: 'JDictSelectTag',
    componentProps: {
      options: [
        {
          label: '已签收',
          value: '3',
        },
        {
          label: '未签收',
          value: '2',
        },
      ],
      stringToNumber: false,
      showChooseOption: false,
    },
    // componentProps: {
    //   dictCode: 'notice_info_status',
    //   placeholder: '请选择',
    //   stringToNumber: false,
    // },
    colProps: { span: 6 },
  },
];
//表单数据
export const formSchema: FormSchema[] = [
  // {
  //   label: '签发单位ID',
  //   field: 'orgId',
  //   component: 'Input',
  // },
  {
    label: '签发单位名称',
    field: 'orgName',
    component: 'Input',
  },
  {
    label: '通知类型',//1整改通知书2预警通知书3管控通知书4考核通知书5表扬通知书
    field: 'type',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'notice_info_type',
      stringToNumber: false,
      showChooseOption: false,
    },
    colProps: {
      span: 24,
    },
  },
  {
    label: '通知书录入方式',//1在线录入，2附件下发
    field: 'entryMethod',
    component: 'JDictSelectTag',
    componentProps: {
      dictCode: 'notice_info_entryMethod',
      placeholder: '请选择',
      stringToNumber: false,
    },
    colProps: {
      span: 24,
    },
  },
  {
    label: '标题',
    field: 'title',
    component: 'Input',
  },
  // {
  //   label: '接收单位ID',
  //   field: 'receiveOrgId',
  //   component: 'Input',
  // },
  {
    label: '接收单位名称',
    field: 'receiveOrgName',
    component: 'Input',
  },
  // {
  //   label: '接收人ID',
  //   field: 'receiveUserId',
  //   component: 'Input',
  // },
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
  // {
  //   label: '状态',//0暂存，1提交，2审核，3签收，4整改，5复查完成
  //   field: 'status',
  //   component: 'JDictSelectTag',
   
  //   componentProps: {
  //     options: [
  //       {
  //         label: '已签收',
  //         value: '3',
  //       },
  //       {
  //         label: '未签收',
  //         value: '2',
  //       },
  //     ],
  //   },
  //   defaultValue: ({ values }) => {

  //     console.log(values)
  //     let  options =  [{label: '已签收', value: '3',},{label: '未签收',value: '2',}];
  //     let label = '';
  //     let type = values.type;
  //     if(type == "4" || type == "5" ){
  //       label = "--";
  //       return label;
  //     }
  //      options.filter((item) => {
  //       if(item.value == values.status){
  //         label =  item.label;
  //         return label;
  //       }
  //     });
  //       return label;
  //   }
  // },
  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];

function getStatus(record){
  let  options =  [{label: '已签收', value: '3',},{label: '未签收',value: '2',}];
  let label = '';
  let type = record.type;
  if(type == "4" || type == "5" ){
    label = "--";
    return label;
  }
  let obj = options.filter((item) => {
    if(item.value == record.status){
      label =  item.label;
      return label;
    }
  });
    return label;
}

function getTime(record){

}

function getSignTime(record){
  let type = record.type;
  let status = record.status;
  let receiveTime = record.receiveTime;
  let distributeTime = record.distributeTime;

  if(type == "1" || type == "2" || type =="3"){
    if(status != "3"){
      record.receiveTime = " ";
    }
  }
  if(type == "4" || type == "5" ){
    record.receiveTime = distributeTime;
  }

}


function getCreater(record){

  let type = record.type;
  let status = record.status;
  let receiveUserName = record.receiveUserName;
  if(type == "1" || type == "2" || type =="3"){
    if(status != "3"){
      record.receiveUserName = " ";
    }else{
      // record.receiveUserName = " ";
    }
  }
  if(type == "4" || type == "5" ){
    record.receiveUserName = " ";
  }
}


// function getOrgId(){
//   if(loginInfo.value.departs.length>0){
//       return loginInfo.value.departs[0].id;
//   }
// }

/**
 * 流程表单调用这个方法获取formSchema
 * @param param
 */
export function getBpmFormSchema(_formData): FormSchema[] {
  // 默认和原始表单保持一致 如果流程中配置了权限数据，这里需要单独处理formSchema
  return formSchema;
}
