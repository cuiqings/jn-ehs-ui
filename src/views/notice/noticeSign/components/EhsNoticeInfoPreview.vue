<template>
  <BasicDrawer
   v-bind="$attrs" 
   @register="registerModal" 
   destroyOnClose :title="title" 
   :width="800" 
   @ok="handleSubmit"
 
   >
    <BasicForm @register="registerForm" />
    <!-- <a-button type="primary" @click="exportDataPdf()" preIcon="ant-design:plus-outlined">下载</a-button> -->

    <div id="downLoadPdf" style="text-align: center;margin:30px 0px;">
      <table width="750" cellpadding="0" cellspacing="0"
        style="margin:auto; margin-top: 5px; border-collapse:collapse;table-layout: fixed;">
        <tbody>
          <tr>
            <td style="width:auto; margin-top: 1px;">
              <img src="/resource/img/logo.png" style="width: 50px; height: 50px;" alt="">
            </td>
            <td style="width:700px;">
              <div class="STYLE1" style="text-align: center;margin-right:25px;">中信重工公司</div>
              <div class="STYLE2" style="text-align: center;margin-right:25px;">{{ titleName }}</div>
            </td>

          </tr>

          <div>
                <span  style="width: 200px; font-size: 12px; font-weight: bold; text-align: left; float: left;">{{ receiveOrgName }}</span>
                <span style="width: 200px; font-size: 12px; font-weight: bold; text-align: right; float: right; margin-right: -550px;">编号: {{ noticeNo }}</span>
          
          </div>
          
         
        </tbody>
      </table>
      <table width="750" cellpadding="0" cellspacing="0" bordercolor="#000000"
        style="margin:auto; margin-top: 5px; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
        <tbody>
          <tr v-if=" entryMethod=='1' ">
            <td v-if="type1||type4" colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
              <div class="STYLE3" style="margin-left: 100px">
                {{ demandName }}
              </div>
              <div v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo" :key="item.id"
                style="margin-bottom: 8px;margin-left: 10px" align="baseline">
                <a-row>
                  <a-form-item :name="['ehsNoticeProblemForm', index, 'problemContent']">
                    <span>{{ index + 1 }}.{{ item.problemContent }}</span>
                  </a-form-item>
                </a-row>
                <a-row>
                  <a-upload 
                  list-type="picture-card" 
                  :headers="headers" 
                  v-model:file-list="item.reviewImgList"
                    :max-count="10" 
                    @preview="imgPreview" 
                    disabled>
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                      <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </a-row>
              </div>
            </td>
            
            <td v-if="type2||type3||type5" colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
              <div class="STYLE3" style="margin-left: 100px">
                {{demandName}}
              </div>
              <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
                {{contentMessage}}
              </div>
            </td>

          </tr>
          <tr v-if="entryMethod=='2'">
           <td colspan="6" class="STYLE3" style="font-weight:normal;text-align: left;">
            附件：
            <a-upload
              v-model:file-list="offlineFileList"
              :headers="headers"
              :data="{'biz':'noticeFile'}"
              :max-count="5"
              @preview="handleFilePreview"
              :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
            >
            </a-upload>
            </td>
          </tr>

          <tr v-if=" entryMethod=='1'" style="height:200px;  border: 1px solid #000;">
            <td class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
            <td colspan="12" class="STYLE4" >{{ content }}</td>
          </tr>
          <tr v-if="type2||type3||type1"  style="height:50px;  border: 1px solid #000;">
            <td class="STYLE3" style="text-align: center; border:1px solid #000;">整改期限</td>
            <td colspan="12" class="STYLE4">{{ endDt }}</td>
          </tr>
          <tr style="height:100px;  border: 1px solid #000;">
  
            <td colspan="6" class="STYLE3" style="text-align: left; border:1px solid #000;">
                <div style="margin-top: 5px;margin-left: 5px">
                签发人签字:
                </div>
                <div style="width: 105px;height: 105px;margin-left:15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="signer"
                  :max-count="1"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
              <div style="font-weight: normal;float: right;margin-top: 8px;margin-right: 5px">
                {{ initiatorTime!=null && initiatorTime!=undefined && initiatorTime!=' ' && initiatorTime != '' ? dayjs(initiatorTime).format('YYYY年 MM月 DD日 HH:mm') : '年  月  日' }}
              </div>
            </td>

          <td colspan="6" class="STYLE3" style="text-align: left;">
            <div style="margin-top: 5px;margin-left: 5px">
              接收单位签字:
              </div>

              <div style="width: 105px;height: 105px;margin-left:15px">
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="recipientSign"
                  :max-count="1"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
  
              <div style="font-weight: normal;float: right;margin-top: 8px;margin-right: 5px">
                {{ receiveTime!=null && receiveTime!=undefined  && receiveTime!=' ' && receiveTime != '' ? dayjs(receiveTime).format('YYYY年 MM月 DD日 HH:mm') : '年  月  日' }}
              </div>
          </td>
        </tr>
        </tbody>
      </table>
       <div v-if="entryMethod==1">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div style="font-weight: normal;margin-top: 8px;margin-left: 10px">
         附件
        </div>
        <div style="margin-top: 3px">
        
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :headers="headers"
            :data="{'biz':'noticeFile'}"
            :max-count="5"
            @preview="handleFilePreview"
            :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
          >
          </a-upload>
        </div>
        
      </div>
      </div>
        <a-collapse v-model:activeKey="activeKey">
      <a-collapse-panel v-if="ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.length>0" key="1" header="审核记录">
        <div  v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo"
              :key="item.id">
          <div class="ant-col ant-col-24">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核人">审核人</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input style="color: #4a5569" :value="item.userMsg" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-24" style="margin-top: -15px">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核意见">审核意见</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-textarea style="color: #4a5569" v-model:value="item.contentMsg" disabled/>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="ant-col ant-col-24" style="margin-top: -15px">
            <div class="ant-row ant-form-item" style="row-gap: 0px;">
              <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
                <label for="form_item_type" title="审核时间">审核时间</label>
              </div>
              <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                   style="width: calc(100% - 150px);">
                <div class="ant-form-item-control-input">
                  <div class="ant-form-item-control-input-content">
                    <div style="display: flex;">
                      <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                        <a-input style="color: #4a5569" :value="item.createTime" disabled></a-input>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
      <a-collapse-panel v-if="(type1||type2||type3)&&(ehsNoticeInfoForm.ehsNoticeInfo.status=='2'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='3'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='4'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='5'
      ||ehsNoticeInfoForm.ehsNoticeInfo.status=='6')" key="2" header="签收记录">
        <div class="ant-col ant-col-24">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type" title="签收人">签收人</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                      <a-input style="color: #4a5569" :value="ehsNoticeInfoForm.ehsNoticeInfo.userMsg" disabled></a-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="ant-col ant-col-24" style="margin-top: -15px">
          <div class="ant-row ant-form-item" style="row-gap: 0px;">
            <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
              <label for="form_item_type" title="签收时间">签收时间</label>
            </div>
            <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
                 style="width: calc(100% - 150px);">
              <div class="ant-form-item-control-input">
                <div class="ant-form-item-control-input-content">
                  <div style="display: flex;">
                    <div style="flex: 110%; width: 100%;"><!-- 显示加载效果 -->
                      <a-input style="color: #4a5569" :value="ehsNoticeInfoForm.ehsNoticeInfo.receiveTime" disabled></a-input>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    </div>

    <template #appendFooter1>
      <a-button type="primary" @click="handleEdit" >确认签字</a-button>
    </template>
  </BasicDrawer>


  <EhsNoticeInfoSign @register="registerSignModal" @refresh="refresh"/>
</template>

<script lang="ts" setup>
import { ref, reactive} from 'vue';
import { BasicForm, useForm } from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
// import {formSchema} from '../EhsNoticeInfo.data';
// import { saveOrUpdate } from '../EhsNoticeInfo.api';
import { initDictOptions } from '/@/utils/dict';
import EhsNoticeInfoSign from './EhsNoticeInfoSign.vue';
import { BasicModal, useModal, useModalInner } from '/src/components/Modal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { getToken } from "/@/utils/auth";
import { UploadProps } from "ant-design-vue";
import { picPreviewUrl, uploadUrl,previewFile } from "/@/api/common/api";
import dayjs, { Dayjs } from 'dayjs';

// Emits声明
const emit = defineEmits(['register', 'success','refresh']);

// 确认签字model
const [registerSignModal, { openModal }] = useModal();

const type = ref("");
const titleName = ref("");
const receiveOrgName = ref("");
const noticeNo = ref("");
const demandName = ref("");
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const initiatorTime = ref("");
const endDt = ref("");
const content = ref("");
const signer =  ref<UploadProps['fileList']>([]);
const receiveTime = ref("");
const entryMethod = ref("1");
const recipientSign =ref<UploadProps['fileList']>([]);
let fileList = ref<UploadProps['fileList']>([]);
let noticeInfoArr = ref<any>([]);
const signFlag = ref("");


const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const contentMessage = ref("");

const activeKey = ref(['1']);

let offlineFileList = ref<UploadProps['fileList']>([]);

interface EhsNoticeInfo {
  id:string;
  orgId:string;
  orgCode: any;
  orgName: any;
  entryMethod: string;
  title: string;
  type: string;
  noticeNo: string;
  receiveOrgName: string;
  receiveOrgId: any;
  receiveUserId: any;
  receiveOrgCode: any,
  receiveUserName: string;
  noticeContent: string;
  content: string;
  attachment: string;
  endDt: string;
  controlStartDt: string;
  controlEndDt: string;
  auditorId: any;
  auditorName: any;
  signature: string;
  status: string;
  signName: string;
  signDepartmentName: string;
  userMsg: string;
  receiveTime: string;
  enpInfo: EhsNoticeProblem[];
  reviewingInfo: EhsNoticeReviewing[];
}

//表单中接口对象
interface EhsNoticeProblemForm {
  problemContent: string;
  img: string;
  id: string;
  reviewImgList: any;
}
//传参接口对象
interface EhsNoticeProblem {
  id: string;
  problemContent: string;
  img: string;
  reviewImgList: any;
}
//审核信息
interface EhsNoticeReviewing {
  id: string;
  content: string;
  status: string;
  createBy: string;
  createTime: string;
  userMsg: string;
  contentMsg: string;
}
const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo}>({
  ehsNoticeInfo: {
    id:'',
    orgId:'',
    orgCode: null,
    orgName: null,
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveOrgCode: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    controlStartDt: '',
    controlEndDt: '',
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    signName: '',
    signDepartmentName: '',
    userMsg: '',
    receiveTime: '',
    enpInfo: [] as any,
    reviewingInfo: [] as any,
  },
});


const handleFilePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
};

const headers = { 'X-Access-Token': getToken() }


// const dynamicValidateForm = reactive<{ ehsNoticeProblemForm: EhsNoticeProblemForm[] }>({
//   ehsNoticeProblemForm: [],
// });


const imgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const imgCancel = (item) => {
  previewVisible.value = false;
  previewTitle.value = '';
};

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

initNoticeInfoType();
/**
 * 初始化字典选项
 */
async function initNoticeInfoType() {

  noticeInfoArr.value = await initDictOptions('notice_info_type');

}


//表单配置
const [registerForm, { resetFields, setFieldsValue, validate }] = useForm({
  labelWidth: 150,
  // schemas: formSchema,
  showActionButtonGroup: false,
  baseColProps: { span: 24 }
});


//表单赋值
const [registerModal, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {


  //重置表单
  await resetFields();
  setDrawerProps({
    okText: '确认签收',
    // confirmLoading: false,
    showCancelBtn: false,
    // showOkBtn:!!data?.showFooter,
    onClick: handleEdit.bind(null, data),
    title : data.showFooter == true ? '通知书签收' :'通知书查看'
  }
  );

  // 为自定义的表格赋值
   const title = data.record.title;
  for (let dictItem of noticeInfoArr._value) {
    if (data.record.type == dictItem.value) {
      type.value = dictItem.text;
    }
  }

  titleName.value = title + type.value;

  ehsNoticeInfoForm.ehsNoticeInfo = {
    id:'',
    orgId:'',
    orgCode: null,
    orgName: null,
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveOrgCode: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    controlStartDt: '',
    controlEndDt: '',
    auditorId: null,
    auditorName: null,
    signature: '',
    status: '',
    signName: '',
    signDepartmentName: '',
    userMsg: '',
    receiveTime: '',
    enpInfo: [] as any,
    reviewingInfo: [] as any,
  }

  Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
    ehsNoticeInfoForm.ehsNoticeInfo[item] = data.record[item] ? data.record[item] : "";
  });

  ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
  const imgList = data.record.enpInfo;
  for(let i=0;i<imgList.length;i++){
    let reviewImgList = [] as any;
    if(imgList[i].img!=""){
      var imgArry = imgList[i].img.split(",")
      for(let j=0;j<imgArry.length;j++){
        if(imgArry[j].indexOf("http")==0){
          reviewImgList.push(
            {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              path: imgArry[j],
              url:  imgArry[j],
            },
          )
        }else{
          reviewImgList.push(
            {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              path: imgArry[j],
              url:  picPreviewUrl+imgArry[j],
            },
          )
        }
      }
    }
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.push(
      {
        problemContent:imgList[i].problemContent,
        id:imgList[i].id,
        img:imgList[i].img,
        reviewImgList:reviewImgList,
      }
    )
  }

    fileList = ref<UploadProps['fileList']>([]);
    if(data.record.attachment != ""&&data.record.attachment != null){
      const attachment = data.record.attachment;
      const attachmentArry = attachment.split(",")
      fileList.value = attachmentArry.map(e=>{
        return {
          uid: Math.random(),
          name: e.replaceAll("noticeFile/",""),
          status: 'done',
          path: e,
          url: picPreviewUrl + e
        }
      })
    }

   //通知书录入：附件线下发
   offlineFileList = ref<UploadProps['fileList']>([]);
    if(data.record.attachment != "" && data.record.attachment != null){
      const attachment = data.record.attachment;
      const attachmentArry = attachment.split(",")
      offlineFileList.value = attachmentArry.map(e=>{
        return {
          uid: Math.random(),
          name: e.replaceAll("noticeFile/",""),
          status: 'done',
          path: e,
          url: picPreviewUrl + e
        }
      })
    }

    if(data.record.reviewingInfo != ""&&data.record.reviewingInfo != null){
    ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo = [];
    for(let i=0;i<data.record.reviewingInfo.length;i++){
      let reviewingInfo = data.record.reviewingInfo[i];
      if(reviewingInfo.status=='2'){
        reviewingInfo.contentMsg = "通过"
        reviewingInfo.userMsg = data.record.orgName + '-' + reviewingInfo.createBy;
      }else if(reviewingInfo.status=='11'){
        reviewingInfo.contentMsg = "不通过：" + reviewingInfo.content;
        reviewingInfo.userMsg = data.record.orgName + '-' + reviewingInfo.createBy;
      }
      ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
        userMsg: reviewingInfo.userMsg,
        id: reviewingInfo.id,
        content: reviewingInfo.content,
        status: reviewingInfo.status,
        createBy: reviewingInfo.createBy,
        createTime: reviewingInfo.createTime,
        contentMsg: reviewingInfo.contentMsg,
      })
    }
    if(data.record.status=="1"){
      ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
        userMsg: data.record.orgName + '-' + data.record.auditorName?data.record.auditorName:"",
        id: "",
        content: "",
        status: "",
        createBy: "",
        createTime: "",
        contentMsg: "",
      })
    }
  }else{
    ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo = [];
    if(ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.length==0){
      if(data.record.status=="1"){
        ehsNoticeInfoForm.ehsNoticeInfo.reviewingInfo.push({
          userMsg: data.record.orgName + '-' + data.record.auditorName?data.record.auditorName:"",
          id: "",
          content: "",
          status: "",
          createBy: "",
          createTime: "",
          contentMsg: "",
        })
      }
    }
  }

  if(ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName!= "" &&ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName!=null){
    if(ehsNoticeInfoForm.ehsNoticeInfo.signName!=null &&  ehsNoticeInfoForm.ehsNoticeInfo.signName!= "" && ehsNoticeInfoForm.ehsNoticeInfo.signName.length > 0 ){
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = ehsNoticeInfoForm.ehsNoticeInfo.signDepartmentName + '-' +ehsNoticeInfoForm.ehsNoticeInfo.signName;
    }else{
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = data.record.signDepartmentName;
    }
  }else{
    if(data.record.receiveUserName!=null && data.record.receiveUserName.trim()!= ""){
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = data.record.receiveOrgName + '-' + data.record.receiveUserName;
    }else{
      ehsNoticeInfoForm.ehsNoticeInfo.userMsg = data.record.receiveOrgName;
    }
  }

  if(data.record.receiveTime != null && data.record.receiveTime.trim() != ""){
    ehsNoticeInfoForm.ehsNoticeInfo.receiveTime = data.record.receiveTime;
  }
  

  demandName.value = "经检查发现你单位存在以下问题，请及时整改：";

  // dynamicValidateForm.ehsNoticeProblemForm = [];
  
  noticeNo.value = data.record.noticeNo;
  receiveOrgName.value = data.record.receiveOrgName;
  content.value = data.record.content;
  endDt.value = data.record.endDt;

  initiatorTime.value = data.record.initiatorTime;

  if(data.record.signature != ""&&data.record.signature != null){
    const signature= data.record.signature;
    let signatureArry  = [];
    if(signature.indexOf("data:image/png;base64")==0){
      signatureArry.push(signature);
      signer.value = signatureArry.map(e=>{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
      })
       
    }else{
      signatureArry = signature.split(",")
      signer.value = signatureArry.map(e=>{
       if(e.indexOf("http")==0){
        return {
          uid: Math.random(),
          name: e,
          status: 'done',
          path: e,
          url: e
        }
      }else{
        return {
          uid: Math.random(),
          name: e.replaceAll("noticeSignatureImg/",""),
          status: 'done',
          path: e,
          url: picPreviewUrl + e
        }
      }
    })

    }
  }

  if(data.record.recipientSign != "" && data.record.recipientSign != null){
    const recipientSignStr= data.record.recipientSign;
    let recipientSignArry = [];
    if(recipientSignStr.indexOf("data:image/png;base64")==0){
       recipientSignArry.push(recipientSignStr);
       recipientSign.value = recipientSignArry.map(e=>{
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
      })
       
    }else{
      recipientSignArry = recipientSignStr.split(",")
      recipientSign.value = recipientSignArry.map(e=>{
        if(e.indexOf("http")==0){
          return {
            uid: Math.random(),
            name: e,
            status: 'done',
            path: e,
            url: e
          }
        }else{
          return {
            uid: Math.random(),
            name: e.replaceAll("noticeSign/",""),
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        }
      })
    }
    
  }
  
  receiveTime.value = data.record.receiveTime;
  entryMethod.value = data.record.entryMethod;

  if(data.record.type=='1'){
      type1.value = true;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      demandName.value="经检查发现你单位存在以下问题，请及时整改：";
      contentMessage.value = data.record.noticeContent;
    }else if(data.record.type=='2'){
      type1.value = false;
      type2.value = true;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      demandName.value="";
      contentMessage.value = data.record.noticeContent;
    }else if(data.record.type=='3'){
      type1.value = false;
      type2.value = false;
      type3.value = true;
      type4.value = false;
      type5.value = false;
      demandName.value="";
      contentMessage.value = data.record.noticeContent;
    }else if(data.record.type=='4'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = true;
      type5.value = false;
      demandName.value="考核问题：";
      contentMessage.value = data.record.noticeContent;
    }else if(data.record.type=='5'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = true;
      demandName.value="";
      contentMessage.value = data.record.noticeContent;
    }


    if('' != recipientSign.value &&  null != recipientSign.value ){

      if(recipientSign.value.indexOf('http') == 0 ){
       signFlag.value = '1';
      }else if(recipientSign.value.indexOf('noticeSign/') == 0){
          signFlag.value = '2';
      }else if(recipientSign.value.indexOf('data:image/png;base64,') == 0){
          signFlag.value = '3';
      }
    }else{
      signFlag.value = '';
    }

});

/**
 * 区分签名来源
 */
function checkSignature(signature) {

  if(null != signature && '' != signature){
    if(signature.indexOf("http")==0){
    return signature;
    }else if(signature.indexOf('data:image/png;base64,') == 0){
      return signature;
    }else{
      return picPreviewUrl + signature;
    }
  }
}



/**
 * 编辑事件
 */
async function handleEdit(record: Recordable) {

  openModal(true, {
    record,
    isUpdate: true,
  });
}

//表单提交事件
async function handleSubmit(v) {
  try {

    //刷新列表
    emit('success');
  } finally {
    setDrawerProps({ confirmLoading: false });
  }
}


async function exportDataPdf() {


  const el = document.getElementById('downLoadPdf');
  html2canvas(el, {
    scale: 3, // 设置缩放
    useCORS: true, // 允许canvas画布内 可以跨域请求外部链接图片, 允许跨域请求。
    allowTaint: true,
    logging: false, // 打印日志用的 可以不加默认为false
    backgroundColor: '#ffffff',
    
  }).then((canvas) => {
    canvas2PDF(canvas);
  })

  const canvas2PDF = canvas => {

    const contentWidth = canvas.width;
    const contentHeight = canvas.height;

    // 一页pdf显示html页面生成的canvas高度;a4纸的尺寸[595.28,841.89],pageHeight是应有高度吗，leftHeight是实际高度
    const pageHeight = (contentWidth / 592.28) * 841.89;
    // 未生成pdf的html页面高度
    let leftHeight = contentHeight;
    // 页面偏移
    let position = 0;
    // a4纸的尺寸[595.28,841.89]，html页面生成的canvas在pdf中图片的宽高
    const imgWidth = 595.28;
    const imgHeight = (595.28 / contentWidth) * contentHeight;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    // 添加水印
    // ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle';
    // ctx.rotate((25 * Math.PI) / 180);
    ctx.font = '15px Microsoft Yahei';
    // ctx.fillStyle = 'rgba(184, 184, 184, 0.8)';
    // for (let i = contentWidth * -1; i < contentWidth; i += 240) {
    //   for (let j = contentHeight * -1; j < contentHeight; j += 100) {
    //     // 填充文字，x 间距, y 间距
    //     ctx.fillText('水印名', i, j);
    //   }
    // }
    //toDataURL()方法是返回一个包含图片展示的数据URL。
    const pageData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF("p", "pt", "a4");
    if (leftHeight < pageHeight) {
      // 在pdf.addImage(pageData, 'JPEG', 左，上，宽度，高度)设置在pdf中显示；
      pdf.addImage(pageData, 'JPEG', 0, 0, imgWidth, imgHeight);
    } else {
      // 分页
      while (leftHeight > 0) {
        pdf.addImage(pageData, 'JPEG', 0, position, imgWidth, imgHeight);
        leftHeight -= pageHeight;
        position -= 841.89;
        // 避免添加空白页
        if (leftHeight > 0) {
          pdf.addPage();
        }
      }
    }
    // 可动态生成
    const fileName = type.value + noticeNo.value;
    pdf.save(`${fileName}.pdf`);
  };
}

 // 子组件传递父组件 刷新页面
 const refresh = (params)=> { 
   
    // 刷新列表
    emit('success');
    
    // 刷新列表
    emit('refresh');
    closeDrawer();

 }

</script>

<style lang="less" scoped>
.STYLE1 {
  // font-family: "宋体";
  font-weight: bold;
  font-size: 24px;
  letter-spacing: 1px;
}

.STYLE2 {
  // font-family: "宋体";
  font-weight: bold;
  font-size: 20px;
  letter-spacing: 1px;
}

.STYLE3 {
  // font-family: "宋体";
  font-size: 13px;
  font-weight: bold;
}

.STYLE4 {
  // font-family: "宋体";
  font-size: 13px;
  font-weight: normal;
  letter-spacing: 1px;
  text-align: left;
}

.STYLE6 {
  // font-family: "宋体";
  font-size: 12px;
  font-weight: bold;
}

/** 时间和数字输入框样式 */
:deep(.ant-input-number) {
  width: 100%
}

:deep(.ant-calendar-picker) {
  width: 100%
}
</style>
