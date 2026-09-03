<template>
  <BasicModal
   v-bind="$attrs"
   @register="registerModal" 
   :title="getTitle" 
   @ok="handleSubmit" 
   width="500px"
   :destroy-on-close = 'true'
   :mask-closable= "false"
    wrap-class-name="full-modal"
   >
    <BasicForm @register="registerForm" />

    <a-form>
   
        <a-row>
          <div style="margin-left: 10px">
            <span style="color: red;">*</span><span>本人签字：</span>
            <!-- <span style="color: red">提示：手机端可更新个人手写签名</span> -->
            <a-upload
              :action="uploadAction"
              list-type="picture-card"
              :headers="headers"
              v-model:file-list="signatureImg"
              :max-count="1"
              :data="{'biz':'noticeSign'}"
              @preview="signatureImgPreview"
              @change="signatureImgChange"
              :before-upload="beforeUploadImage"
            >
              <div v-if="signatureImg.length < 2">
                <plus-outlined />
                <div class="ant-upload-text">上传</div>
              </div>
            </a-upload>
            <a-modal :visible="previewVisible" :footer="null" @cancel="signatureImgCancel">
              <img alt="example" style="width: 100%" :src="previewImage" />
            </a-modal>
            <span style="color: red;float: left">*</span><span style="float: left">整改责任人：</span>
            <div style="float: left">
              <a-select
              
                placeholder="请选择"
                v-model:value="correctorId"
                style="width: 250px"
                :options="receiveUserOptions"
                show-search
                :filter-option="filterOption"
                @change="auditorIdSelectChange"
                label-in-value
                def
              ></a-select>
            </div>
          </div>
        </a-row>
     
  </a-form>

  </BasicModal>


  
</template>
<script lang="ts" setup>
  import {  ref, reactive ,computed} from 'vue';
  import { BasicModal ,useModalInner } from '/src/components/Modal';
  import { BasicForm, useForm } from '/src/components/Form';

  // import { formSchema } from '../EhsNoticeInfoSign.data';
  import { confirmSign } from '../EhsNoticeInfo.api';
  import {getToken} from "/@/utils/auth";
  import {Base64} from 'js-base64';
  import {message, Upload} from 'ant-design-vue';
  import type {UploadProps,UploadChangeParam} from 'ant-design-vue';
  import {FormSchema} from '/@/components/Table';
  import dayjs,{Dayjs } from 'dayjs';
  import {picPreviewUrl,uploadUrl} from '/src/api/common/api.ts';
  import {useUserStore} from '/@/store/modules/user';
  import {defHttp} from "/@/utils/http/axios";
  import { useMessage } from '/@/hooks/web/useMessage';

  //图片上传
  const uploadAction = uploadUrl;
  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  let orgCode = userinfo.value.orgCode

  const correctorId = ref("");
  correctorId.value = userinfo.value.id;
  const correctorName = ref("");
  const receiveUserOptions = ref([]);

  const signatureImgCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

getReceiveUser(orgCode);

  const beforeUploadImage: UploadProps['beforeUpload'] = file => {
  const isPng = file.type === 'image/png';
  const isJpeg = file.type === 'image/jpeg';
  const isJpg = file.type === 'image/jpg';
  const isLt300M = file.size / 1024 / 1024 < 300;
  if (!isLt300M) {
    message.error('文件过大，请不要超过300M！');
    return false || Upload.LIST_IGNORE;
  } else if (!isPng&&!isJpeg&&!isJpg) {
    message.error(`文件格式错误，仅支持png、jpeg、jpg格式！`);
    return false || Upload.LIST_IGNORE;
  }
};

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const signatureImgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

function signatureImgChange(info: UploadChangeParam) {
  if(Array.isArray(signatureImg.value) && signatureImg.value.length > 0){
    signatureImg.value = signatureImg.value.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: e.url.split("/")[e.url.split("/").length-1],
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: e.response.message.replaceAll("noticeFile/",""),
            path: e.response.message,
            status: 'done',
            url: picPreviewUrl + e.response.message
          }
        }
      }else{
        return e
      }
    })
  }else{
    signatureImg.value = []
  }
}

  let signatureImg = ref<UploadProps['fileList']>([]);
  const headers = { 'X-Access-Token': getToken() }


  // 声明Emits
  const emit = defineEmits(['success', 'register','refresh']);
  const previewVisible = ref(false);
  const previewImage = ref('');
  const previewTitle = ref('');


  const isUpdate = ref(true);

  //表单数据
 const formSchema: FormSchema[] = [
 

  // TODO 主键隐藏字段，目前写死为ID
  {
    label: '',
    field: 'id',
    component: 'Input',
    show: false
  },
];

  const params = reactive({
    id : "",
    status : "3",
    signature : "",
    correctorName : "",
    signName :"",
    signDepartmentName : "",
    type:""
  })

  const {  createWarningModal } = useMessage();

  //表单配置
  const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
    schemas: formSchema,
    showActionButtonGroup: false,
    // mergeDynamicData: props,
    labelCol: {
      xs: { span: 24 },
      sm: { span: 4 },
    },
    wrapperCol: {
      xs: { span: 24 },
      sm: { span: 18 },
    },
  });
  //表单赋值
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {

    params.id = data.record.record.id ;
    params.type = data.record.record.type ;
    //表单赋值
    await setFieldsValue({
      ...data.record,
    });

    if(userinfo.value.signature!=null&&userinfo.value.signature!=""&&userinfo.value.signature!=undefined){
      signatureImg.value = [];
      let signatureImgArry = [];
      signatureImgArry.push(userinfo.value.signature);
      signatureImg.value = signatureImgArry.map(e=>{
        return {
          uid: Math.random(),
          name: e,
          status: 'done',
          path: e,
          url: e
        }
      })
    }
   
  });

  function warningMessage(msg) {
  createWarningModal({ title: '警告！', content: msg });
}

  //设置标题
  const getTitle = '签 收';

  //表单提交事件
  async function handleSubmit(v) {
    try {
        if(signatureImg.value.length==0){
            warningMessage('未做签名！');
            return;
        }

        if(correctorId.value == null ||  correctorId.value == ""){
            warningMessage('未指定整改责任人！');
            return;
        }

        const values = await validate();
        values.id = params.id;
        values.status = params.status;
        values.signName = loginInfo.value.userInfo.realname;
        if(loginInfo.value.departs.length>0){
          values.signDepartmentName = loginInfo.value.departs[0].departName;
        }
        values.recipientSign = signatureImg.value.map(e=>{
               return e.path;
         }).join(',');

        values.correctorId = correctorId.value;
        values.type = params.type;
       
      setModalProps({ confirmLoading: true });
      //提交表单
      await confirmSign(values, isUpdate.value);
      //关闭弹窗
      closeModal();
      //刷新列表
      emit('success');

      // 子组件传递父组件刷新页面
      emit('refresh');
      
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  async function getReceiveUser(orgCode) {
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCodeForV2AndV3',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    receiveUserOptions.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

function auditorIdSelectChange(v) { 
  correctorId.value = v.key;
  correctorName.value = v.label;
}
const filterOption = (input: string, option: any) => {
  return option.label.indexOf(input) >= 0;
};

</script>
