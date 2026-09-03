import {BasicColumn,FormSchema} from '/@/components/Table';
import {useUserStore} from '/@/store/modules/user';
import {ref, computed} from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { defHttp } from '/@/utils/http/axios';

import { Upload} from "ant-design-vue";
import dayjs, { Dayjs } from 'dayjs';

const { createMessage } = useMessage();
const userStore = useUserStore();
const loginInfo = computed(() => userStore.getLoginInfo);
const departId = ref("");
const receiveUserOptions = ref([]);

 async function getReceiveUser() {

  if(loginInfo.value.departs.length>0){
    departId.value = loginInfo.value.departs[0].id;
    let params = {
      departIds: departId.value
    };

    let res = await defHttp.get({
      url: '/jn/common/getUserInfo',
      params
    }, {isTransformResponse: false});
    if (res.success && res.result) {
      // 组装
      for(let item of res.result){
        let record = {'label':item.label ,'value':item.label +"~" + item.value};
        receiveUserOptions.value.push(record);
      }
      // receiveUserOptions.value = [...res.result];
    } else {
      console.log('数根节点查询结果异常', res);
    }
  }

}
getReceiveUser();


export const applyFormSchema: FormSchema[] = [
 
  {
    label: '',
    field: 'type',
    component: 'Input',
    show: false
  },

  {
    label: '',
    field: 'applyId',
    component: 'Input',
    show: false
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '初稿文件',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '1'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传初稿文件',
      },
    ],
  },

  {
    label: '审核人',
    field: 'auditer',
    required: true,
    helpMessage: '请添加审核人',
    component: 'JSelectMultiple',
    componentProps: { 
      mode: 'multiple',
      options: receiveUserOptions,
   
    },
    ifShow: ({ values }) => {
      if(values.type == '1'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },

  {
    field: 'commitTime',
    label: '提交时间',
    required: true,
    component: 'DatePicker',
    helpMessage: '请选择时间',
    componentProps: {
      showTime: true,  // Boolean|Object  控制时分秒显示
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
      // disabledDate: (current) => {
      //   const today = new Date();
      //   // 将当前日期转换为时间戳
      //   const todayTimestamp = today.getTime();
      //   // 将当前日期之前的日期转换为时间戳
      //   const currentTimestamp = current.valueOf();
      //   // 判断当前日期是否在当前日期之前
      //   return currentTimestamp > todayTimestamp;
      // },
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => {
      if(values.type == '2'){
        return true;
      }else{
        return false;
      }
    },
    
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '提交资料',
    ifShow: ({ values }) => {
      if(values.type == '2'){
        return true;
      }else{
        return false;
      }
    },
    
  },


  {
    field: 'auditEndDt',
    label: '专家会时间',
    required:true,
    helpMessage: '请选择时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,  // Boolean|Object  控制时分秒显示
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => {
      if(values.type == '10' ){
        return true;
      }else{
        return false;
      }
    },
  },


  {
    field: 'auditEndAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '会议资料',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '10'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传会议资料',
      },
    ],
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '报批版文件',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '3'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传报批版文件',
      },
    ],
  },
  {
    label: '审核人',
    field: 'auditer',
    required: true,
    helpMessage: '请添加审核人',
    component: 'JSelectMultiple',
    componentProps: { 
      mode: 'multiple',
      options: receiveUserOptions,
    },
    ifShow: ({ values }) => {
      if(values.type == '3'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },
 
  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '环评报告终稿',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '4'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传环评报告终稿',
      },
    ],
  },
  {
    field: 'otherAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaProceed',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '环评其他材料',
    ifShow: ({ values }) => {
      if(values.type == '4'){
        return true;
      }else{
        return false;
      }
    },
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    required : true,
    componentProps: {
      bizPath:'eiaAccept',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '验收提资单',
    ifShow: ({ values }) => {
      if(values.type == '5'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传验收提资单',
      },
    ],
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    // required : true,
    componentProps: {
      bizPath:'eiaAccept',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '初稿文件',
    ifShow: ({ values }) => {
      if(values.type == '6'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传初稿文件',
      },
    ],
  },
  {
    label: '审核人',
    field: 'auditer',
    required: true,
    helpMessage: '请添加审核人',
    component: 'JSelectMultiple',
    componentProps: {
      mode: 'multiple', 
      options: receiveUserOptions,
    },
    ifShow: ({ values }) => {
      if(values.type == '6'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaAccept',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '验收报告终版',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '7'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传验收报告终版',
      },
    ],
  },
  {
    field: 'otherAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaAccept',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '验收其他材料',
    ifShow: ({ values }) => {
      if(values.type == '7'){
        return true;
      }else{
        return false;
      }
    },
  },
  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '许可证文件',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '16'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传许可证文件',
      },
    ],
  },

  {
    label: '审核意见',
    field: 'auditComments',
    helpMessage: '请添加审核意见',
    component: 'Input',
    required:true,
    colProps: { span: 24, },
    ifShow: ({ values }) => {
      if(values.type == '9'){
        return true;
      }else{
        return false;
      }
    },
  },

  {
    label: ' 审核结果', 
    field: 'status',
    component: 'RadioGroup',
    required:true,
    componentProps: () => {
      return {
        options: [
          { label: '通过', value: '2' },
          { label: '不通过', value: '3' },
        ],
    
      }
    },
    ifShow: ({ values }) => {
      if(values.type == '11' || values.type == '18'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },
  {
    label: '审核说明',
    field: 'auditStatement',
    helpMessage: '请添加审核说明',
    component: 'InputTextArea',
    componentProps: {
      maxlength: 300,
    },
    // required:true,
    colProps: { span: 24, },
    ifShow: ({ values }) => {
      if(values.type == '11' || values.type == '18'){
        return true;
      }else{
        return false;
      }
    },
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    required : true,
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '排污提资单',
    ifShow: ({ values }) => {
      if(values.type == '12'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传排污提资单',
      },
    ],
  },
  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '初稿文件',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '13'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传初稿文件',
      },
    ],
  },

  {
    label: '审核人',
    field: 'auditer',
    required: true,
    helpMessage: '请添加审核人',
    component: 'JSelectMultiple',
    componentProps: { 
      mode: 'multiple',
      options: receiveUserOptions,
   
    },
    ifShow: ({ values }) => {
      if(values.type == '13'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },

  {
    field: 'commitTime',
    label: '提交时间',
    required: true,
    component: 'DatePicker',
    helpMessage: '请选择时间',
    componentProps: {
      showTime: true,  // Boolean|Object  控制时分秒显示
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
      // disabledDate: (current) => {
      //   const today = new Date();
      //   // 将当前日期转换为时间戳
      //   const todayTimestamp = today.getTime();
      //   // 将当前日期之前的日期转换为时间戳
      //   const currentTimestamp = current.valueOf();
      //   // 判断当前日期是否在当前日期之前
      //   return currentTimestamp > todayTimestamp;
      // },
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => {
      if(values.type == '14'){
        return true;
      }else{
        return false;
      }
    },
    
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '提交资料',
    ifShow: ({ values }) => {
      if(values.type == '14'){
        return true;
      }else{
        return false;
      }
    },
    
  },

  {
    field: 'reviewAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 1,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '报批版文件',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '15'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传报批版文件',
      },
    ],
  },
  {
    label: '审核人',
    field: 'auditer',
    required: true,
    helpMessage: '请添加审核人',
    component: 'JSelectMultiple',
    componentProps: { 
      mode: 'multiple',
      options: receiveUserOptions,
    },
    ifShow: ({ values }) => {
      if(values.type == '15'){
        return true;
      }else{
        return false;
      }
    },
    colProps: { span: 24, },
  },


  {
    field: 'auditEndDt',
    label: '专家会时间',
    required:true,
    helpMessage: '请选择时间',
    component: 'DatePicker',
    componentProps: {
      showTime: true,  // Boolean|Object  控制时分秒显示
      format: 'YYYY-MM-DD HH:mm',
      valueFormat: 'YYYY-MM-DD HH:mm:ss',
      style: {
        width: '100%',
      },
    },
    colProps: { span: 24 },
    ifShow: ({ values }) => {
      if(values.type == '17' ){
        return true;
      }else{
        return false;
      }
    },
  },


  {
    field: 'auditEndAttach',
    component: 'JUpload',
    helpMessage: '请添加附件',
    componentProps: {
      bizPath:'eiaPollution',
      maxCount: 10,
      text:'添加附件',
      beforeUpload: (file: File) => {
        const isLt300M = file.size / 1024 / 1024 < 300;
        if (!isLt300M) {
          createMessage.error('文件过大，请不要超过300M！');
          return false || Upload.LIST_IGNORE;
        }
        return isLt300M;
      },
    },
    colProps: { span: 24, },
    label: '会议资料',
    // required:true,
    ifShow: ({ values }) => {
      if(values.type == '17'){
        return true;
      }else{
        return false;
      }
    },
    rules: [
      {
        required: true,
        message: '请上传会议资料',
      },
    ],
  },

  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];
