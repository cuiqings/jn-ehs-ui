<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
    <template #appendFooter1>
      <a-button color="success" @click="reviewingNo">不通过</a-button>
    </template>
    <template #appendFooter2>
      <a-button type="primary" @click="reviewing">审核通过</a-button>
    </template>
    <a-row style="text-align: center;margin-right: 90px">
      <a-col :span="4">
        <img src="/resource/img/logo.png" style="width: 50px; height: 50px;" alt="">
      </a-col>
      <a-col :span="20">
        <div class="STYLE1">中信重工公司</div>
        <div class="STYLE2">{{ehsNoticeInfoForm.ehsNoticeInfo.title}}{{typeName}}</div>
      </a-col>
    </a-row>
    <a-row style="float: right;margin-right: 5px">
      <a-col :span="24">
        <div class="STYLE3"> 编号: {{ ehsNoticeInfoForm.ehsNoticeInfo.noticeNo }}</div>
      </a-col>
    </a-row>
    <a-row>
    </a-row>
    <div style="text-align: center;">
      <table width="762" height="100%" cellpadding="0" cellspacing="0" bordercolor="#000000" style="margin:auto; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
        <tbody>
        <tr style="height:50px; border: 1px solid #000;" >
          <td colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            {{ehsNoticeInfoForm.ehsNoticeInfo.receiveOrgName}}:
          </td>
        </tr>
        <tr v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1">
          <td v-if="type1||type4" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div class="STYLE3" style="margin-left: 100px">
              {{typeNameTip}}
            </div>
            <div
              v-for="(item, index) in ehsNoticeInfoForm.ehsNoticeInfo.enpInfo"
              :key="item.id"
              style="margin-bottom: 8px;margin-left: 10px"
              align="baseline">
              <a-row>
                <a-form-item :name="['enpInfo', index, 'problemContent']">
                  <span>{{index+1}}.{{item.problemContent}}</span>
                </a-form-item>
                <MinusCircleOutlined style="margin-top: 8px;margin-left: 5px;color: red" @click="removeEhsNoticeProblem(item)"/>
              </a-row>
              <a-row>
                <a-upload
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="item.reviewImgList"
                  :max-count="10"
                  @preview="imgPreview"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </a-row>
            </div>
          </td>
          <td v-if="type2||type3||type5" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div class="STYLE3" style="margin-left: 100px">
              {{typeNameTip}}
            </div>
            <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
              <a-form-item label="" style="width:738px;margin-left: 10px">
                {{ehsNoticeInfoForm.ehsNoticeInfo.noticeContent}}
              </a-form-item>
            </div>
          </td>
        </tr>
        <tr v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==2" style="height:50px; border: 1px solid #000;" >
          <td colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
            附件：
            <a-upload
              v-model:file-list="fileList"
              name="file"
              :headers="headers"
              :data="{'biz':'noticeFile'}"
              :max-count="5"
              @preview="handlePreview"
              :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
            >
            </a-upload>
          </td>
        </tr>
        <tr v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1&&(type1||type2||type3||type4)" style="height:100%;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
            <a-row>
              {{demandName}}
            </a-row>
            <a-row>
              {{ ehsNoticeInfoForm.ehsNoticeInfo.content }}
            </a-row>
          </td>
        </tr>
        <tr v-if="type1||type2||type3" style="height:21.00pt;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">{{endDtName}}</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ ehsNoticeInfoForm.ehsNoticeInfo.endDt }}</td>
        </tr>
        <tr v-if="type3" style="height:21.00pt;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">管控时间</td>
          <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">{{ controlDt }}</td>
        </tr>
        <tr v-if="type1||type2||type3||type4" style="height:100px;  border: 1px solid #000;">
          <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
            <div style="margin-top: 5px;margin-left: 5px">
              签发人签字：
            </div>
            <div style="width: 30px;height: 30px;margin-left: 15px">
              <a-upload
                list-type="picture-card"
                :headers="headers"
                v-model:file-list="signatureImg"
                :max-count="10"
                @preview="imgPreview"
                disabled
              >
              </a-upload>
              <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                <img alt="example" style="width: 100%" :src="previewImage" />
              </a-modal>
            </div>
            <div style="float: right;margin-top: 70px;margin-right: 10px">
              {{ ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!=""?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime).format('YYYY年MM月DD日'):"年  月  日" }}
            </div>
          </td>
          <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
            <a-row style="margin-top: 5px;margin-left: 5px">
              接收单位签字：
            </a-row>
            <a-row>

            </a-row>
            <a-row style="float: right;margin-top: 100px;margin-right: 10px">
               年    月    日
            </a-row>
          </td>
        </tr>
        <tr v-if="type5" style="height:100px;  border: 1px solid #000;">
          <td colspan="14" class="STYLE3" style="text-align: left; border:1px solid #000;">
            <div style="margin-top: 5px;margin-left: 5px">
              签发人签字：
            </div>
            <div style="width: 30px;height: 30px;margin-left: 15px">
              <a-upload
                list-type="picture-card"
                :headers="headers"
                v-model:file-list="signatureImg"
                :max-count="10"
                @preview="imgPreview"
                disabled
              >
              </a-upload>
              <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                <img alt="example" style="width: 100%" :src="previewImage" />
              </a-modal>
            </div>
            <div style="float: right;margin-top: 70px;margin-right: 10px">
              {{ ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime!=""?dayjs(ehsNoticeInfoForm.ehsNoticeInfo.initiatorTime).format('YYYY年MM月DD日'):"年  月  日" }}
            </div>
          </td>
        </tr>
        <tr v-if="type1||type2||type3||type4" style="height:130px;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
          <td colspan="12" class="STYLE3" style="text-align: right; border:1px solid #000;">
            <a-row style="margin-top: 180px;margin-left: 550px">
              签字：
            </a-row>
            <a-row>

            </a-row>
            <a-row style="margin-top: 30px;margin-left: 550px">
              年    月    日
            </a-row>
          </td>
        </tr>
        <tr v-if="type1||type2||type3||type4" style="height:130px;  border: 1px solid #000;">
          <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
          <td colspan="12" class="STYLE3" style="text-align: right; border:1px solid #000;">
            <a-row style="margin-top: 180px;margin-left: 550px">
              签字：
            </a-row>
            <a-row>

            </a-row>
            <a-row style="margin-top: 30px;margin-left: 550px">
              年    月    日
            </a-row>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-if="ehsNoticeInfoForm.ehsNoticeInfo.entryMethod==1" class="ant-col ant-col-24">
      <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">
          <label for="form_item_type" style="margin-top: 5px" title="附件">附件</label>
        </div>
        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"
             style="width: calc(100% - 150px);margin-top: 3px">
          <div class="ant-form-item-control-input">
            <div class="ant-form-item-control-input-content">
              <div style="display: flex;">
                <div style="flex: 110%; width: 100%;margin-top: -6px"><!-- 显示加载效果 -->
                  <a-upload
                    v-model:file-list="fileList"
                    name="file"
                    :headers="headers"
                    :data="{'biz':'noticeFile'}"
                    :max-count="5"
                    @preview="handlePreview"
                    :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                  >
                  </a-upload>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <a-modal v-model:visible="visibleOk" title="审核通过"  style="top: 300px;left: 400px" @ok="handleOk">
      <a-row>
        <div style="margin-left: 10px">
          <span style="color: red;">*</span><span>本人签字：</span>
          <a-upload
            :action="uploadAction"
            list-type="picture-card"
            :headers="headers"
            v-model:file-list="auditorSignImg"
            :max-count="1"
            :data="{'biz':'noticeAuditorSignImg'}"
            @preview="auditorSignImgPreview"
            @change="auditorSignImgChange"
          >
            <div v-if="auditorSignImg.length < 2">
              <plus-outlined />
              <div class="ant-upload-text">上传</div>
            </div>
          </a-upload>
          <a-modal :visible="previewVisible" :footer="null" @cancel="auditorSignImgCancel">
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
          <span style="color: red;float: left"></span><span style="float: left">下一节点审核人：</span>
          <div style="float: left">
            <a-select
              placeholder="请选择"
              v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.auditorId"
              style="width: 250px"
              :options="auditorInfo"
              show-search
              :filter-option="filterOption"
              @change="auditorIdSelectChange"
              label-in-value
            ></a-select>
          </div>
        </div>
      </a-row>
    </a-modal>
    <a-modal v-model:visible="visibleNo" title="审核不通过"  style="top: 300px;left: 400px" @ok="handleNo">
      <a-row>
        <div style="margin-left: 10px">
          <span style="color: red;">*</span><span>审核说明：</span>
          <a-form-item label="" style="width:500px;" name="reviewingContent">
            <a-textarea :rows="5" :maxlength="50" showCount="true" v-model:value="ehsNoticeInfoForm.ehsNoticeInfo.reviewingContent" placeholder="请输入通知书内容"/>
          </a-form-item>
        </div>
      </a-row>
    </a-modal>
<!--    <div class="ant-col ant-col-24">-->
<!--      <div class="ant-row ant-form-item" style="row-gap: 0px;">-->
<!--        <div class="ant-col ant-form-item-label" style="width: 150px;font-size: 13px">-->
<!--          <label for="form_item_type" class="ant-form-item-required" title="附件">附件</label>-->
<!--        </div>-->
<!--        <div class="ant-col ant-col-xs-24 ant-col-sm-18 ant-form-item-control"-->
<!--             style="width: calc(100% - 150px);">-->
<!--          <div class="ant-form-item-control-input">-->
<!--            <div class="ant-form-item-control-input-content">-->
<!--              <div style="display: flex;">-->
<!--                <div style="flex: 110%; width: 100%;">&lt;!&ndash; 显示加载效果 &ndash;&gt;-->
<!--                  <a-upload-->
<!--                    v-model:file-list="fileList"-->
<!--                    name="file"-->
<!--                    :headers="headers"-->
<!--                    :data="{'biz':'noticeFile'}"-->
<!--                    :max-count="5"-->
<!--                  >-->
<!--                  </a-upload>-->
<!--                </div>-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->
<!--        </div>-->
<!--      </div>-->
<!--    </div>-->
  </BasicDrawer>
</template>

<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {BasicForm, useForm} from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
import {formSchema} from '../EhsNoticeInfo.data';
import {SelectProps, UploadChangeParam, UploadProps} from "ant-design-vue";
import {approve} from '../EhsNoticeInfo.api';
import {defHttp} from "/@/utils/http/axios";
import {picPreviewUrl, previewFile, uploadUrl} from "/@/api/common/api";
import dayjs, {Dayjs} from "dayjs";
import {getToken} from "/@/utils/auth";
import {useMessage} from "/@/hooks/web/useMessage";
import {useUserStore} from '/@/store/modules/user';

const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
const { createMessage, createConfirm, createSuccessModal, createInfoModal, createErrorModal, createWarningModal, notification } = useMessage();
const headers = { 'X-Access-Token': getToken() }
const emit = defineEmits(['register','success']);
const isUpdate = ref(true);
const noticeInfoType = ref<SelectProps['options']>([]);
const auditorInfo = ref<SelectProps['options']>([]);
const typeName = ref("");
const dateFormat = 'YYYY-MM-DD';
const uploadAction = uploadUrl;
let fileList = ref<UploadProps['fileList']>([]);
let signatureImg = ref<UploadProps['fileList']>([]);
let auditorSignImg = ref<UploadProps['fileList']>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');
const demandName = ref("");
const typeNameTip = ref("");
const endDtName = ref('整改期限');
const type1 = ref(false);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
let orgCode = userinfo.value.orgCode;
const controlDt = ref("");
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

interface EhsNoticeInfo {
  id:string;
  orgId:string;
  entryMethod: string;
  title: string;
  type: string;
  noticeNo: string;
  receiveOrgName: string;
  receiveOrgId: any;
  receiveUserId: any;
  receiveUserName: string;
  noticeContent: string;
  content: string;
  attachment: string;
  endDt: string;
  auditorId: any;
  auditorName: any;
  auditorSign: string;
  status: string;
  initiatorTime: string;
  distributeTime: string;
  receiveTime: string;
  reviewingContent: string;
  enpInfo: EhsNoticeProblem[];
}

const ehsNoticeInfoForm = reactive<{ ehsNoticeInfo: EhsNoticeInfo}>({
  ehsNoticeInfo: {
    id:'',
    orgId:'',
    entryMethod: '1',
    title: '',
    type: '',
    noticeNo: '',
    receiveOrgName: '',
    receiveOrgId: null,
    receiveUserId: null,
    receiveUserName: '',
    content:'',
    noticeContent: '',
    attachment:'',
    endDt: '',
    auditorId: null,
    auditorName: null,
    auditorSign: '',
    status: '',
    initiatorTime: '',
    distributeTime: '',
    receiveTime: '',
    reviewingContent:'',
    enpInfo: [] as any,
  },
});
// const dynamicValidateForm = reactive<{ ehsNoticeProblemForm: EhsNoticeProblemForm[]}>({
//   ehsNoticeProblemForm: [],
// });

async function getAuditorUser(orgCode) {
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCodeForV2AndV3',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    auditorInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}


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
}

const removeEhsNoticeProblem = (item: EhsNoticeProblemForm) => {
  // const index = dynamicValidateForm.ehsNoticeProblemForm.indexOf(item);
  // if (index !== -1) {
  //   dynamicValidateForm.ehsNoticeProblemForm.splice(index, 1);
  // }
  const index = ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.indexOf(item);
  if (index !== -1) {
    ehsNoticeInfoForm.ehsNoticeInfo.enpInfo.splice(index, 1);
  }
};

const auditorSignImgCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const auditorSignImgPreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

function auditorSignImgChange(info: UploadChangeParam) {
  if(Array.isArray(auditorSignImg.value) && auditorSignImg.value.length > 0){
    auditorSignImg.value = auditorSignImg.value.map(e=>{
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
    auditorSignImg.value = []
  }
}

function auditorIdSelectChange(v) { //{key,label}
  ehsNoticeInfoForm.ehsNoticeInfo.auditorId = v.key;
  ehsNoticeInfoForm.ehsNoticeInfo.auditorName = v.label;
}

const filterOption = (input: string, option: any) => {
  return option.label.indexOf(input) >= 0;
};

//表单配置
const [registerForm, {validate}] = useForm({
    labelWidth: 150,
    schemas: formSchema,
    showActionButtonGroup: false,
    baseColProps: {span: 24}
});
//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
    //重置表单
    setDrawerProps({
      okText: '保存',
      confirmLoading: false,
      showCancelBtn:!!data?.showFooter,
      showOkBtn:false
    });
    //表单赋值

  if (data.record.orgId == '') {
    data.record.isOther = '1';
  }
  Object.keys(ehsNoticeInfoForm.ehsNoticeInfo).forEach((item) => {
    ehsNoticeInfoForm.ehsNoticeInfo[item] = data.record[item] ? data.record[item] : "";
  });
  // dynamicValidateForm.ehsNoticeProblemForm=[];
  ehsNoticeInfoForm.ehsNoticeInfo.enpInfo = [];
  const imgList = data.record.enpInfo;
  for(let i=0;i<imgList.length;i++){
    let reviewImgList = [] as any;
    if(imgList[i].img!=''){
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
  if(data.record.signature != ""&&data.record.signature != null){
    const signature= data.record.signature;
    const signatureArry = signature.split(",")
    signatureImg.value = signatureArry.map(e=>{
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
  // if(data.record.auditorSign != ""&&data.record.auditorSign != null){
  //   const auditorSign = data.record.auditorSign;
  //   const auditorSignArry = auditorSign.split(",")
  //   auditorSignImg.value = auditorSignArry.map(e=>{
  //     return {
  //       uid: Math.random(),
  //       name: e.replaceAll("noticeAuditorSignImg/",""),
  //       status: 'done',
  //       path: e,
  //       url: picPreviewUrl + e
  //     }
  //   })
  // }
  ehsNoticeInfoForm.ehsNoticeInfo.auditorId = "";
  ehsNoticeInfoForm.ehsNoticeInfo.auditorName = "";
  if(userinfo.value.signature!=null&&userinfo.value.signature!=""&&userinfo.value.signature!=undefined){
    auditorSignImg.value = [];
    let auditorSignImgArry = [];
    auditorSignImgArry.push(userinfo.value.signature);
    auditorSignImg.value = auditorSignImgArry.map(e=>{
      return {
        uid: Math.random(),
        name: e,
        status: 'done',
        path: e,
        url: e
      }
    })
  }
  for (let i = 0; i < noticeInfoType._value.length; i++) {
    if (ehsNoticeInfoForm.ehsNoticeInfo.type == noticeInfoType._value[i].value) {
      typeName.value = noticeInfoType._value[i].text;
    }
  }
  if(ehsNoticeInfoForm.ehsNoticeInfo.type == '1'){
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述问题，整改要求如下：";
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    endDtName.value="整改期限"
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '2'){
    type1.value = false;
    type2.value = true;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述预警内容，整改要求如下：";
    typeNameTip.value="";
    endDtName.value="整改期限"
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '3'){
    type1.value = false;
    type2.value = false;
    type3.value = true;
    type4.value = false;
    type5.value = false;
    demandName.value = "针对上述管控内容，整改要求如下：";
    typeNameTip.value="";
    endDtName.value="反馈期限"
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '4'){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    demandName.value = "针对上述问题，进行考核：";
    typeNameTip.value="考核问题：";
  }else if(ehsNoticeInfoForm.ehsNoticeInfo.type == '5'){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = true;
    demandName.value = "";
    typeNameTip.value="";
  }

  controlDt.value =  dayjs(data.record.controlStartDt).format('YYYY-MM-DD HH:mm') + "  --  " +  dayjs(data.record.controlEndDt).format('YYYY-MM-DD HH:mm');

});

function warningMessage(msg) {
  createWarningModal({ title: '警告！', content: msg });
}

//设置标题
const title = computed(() => ('发通知'));

//审核通过
const visibleOk = ref<boolean>(false);
const reviewing = () => {
  if(orgCode.length>0){
    getAuditorUser(orgCode);
    visibleOk.value = true;
  }
}


//审核通过签字
async function handleOk(v) {
  if(ehsNoticeInfoForm.ehsNoticeInfo.status=="1"){
    if(auditorSignImg.value.length==0){
      warningMessage('未做签名！');
      return;
    }
    try {
      let auditorSign = auditorSignImg.value.map(e=>{
        return e.path;
      }).join(',');

      let values = {
        id: ehsNoticeInfoForm.ehsNoticeInfo.id,
        status: '2',
        reviewingContent: '通过',
        auditorSign:auditorSign,
        auditorId:ehsNoticeInfoForm.ehsNoticeInfo.auditorId,
        auditorName: ehsNoticeInfoForm.ehsNoticeInfo.auditorName,
      };
      setDrawerProps({confirmLoading: true});
      //提交表单
      await approve(values);
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      setDrawerProps({confirmLoading: false});
    }
  }else{
    let statusStr = "";
    if(ehsNoticeInfoForm.ehsNoticeInfo.status=="0"){
      statusStr = "草稿";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="2"){
      statusStr = "已审核";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="3"){
      statusStr = "已签收";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="4"){
      statusStr = "整改中";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="5"){
      statusStr = "待复查";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="6"){
      statusStr = "复查完成";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="11"){
      statusStr = "审核已退回";
    }
    warningMessage('当前为'+statusStr+'状态，不能审核！')
  }
  visibleOk.value = false;
}

//审核不通过
const visibleNo = ref<boolean>(false);
const reviewingNo = () => {
  visibleNo.value = true;
}

//审核不通过
async function handleNo(v) {
  if(ehsNoticeInfoForm.ehsNoticeInfo.reviewingContent.length<=0){
    warningMessage('请输入审核说明！')
    return;
  }
  if(ehsNoticeInfoForm.ehsNoticeInfo.status=="1"){
    try {
      let values = {
        id: ehsNoticeInfoForm.ehsNoticeInfo.id,
        status: '11',
        reviewingContent: ehsNoticeInfoForm.ehsNoticeInfo.reviewingContent
      };
      setDrawerProps({confirmLoading: true});
      //提交表单
      await approve(values);
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      setDrawerProps({confirmLoading: false});

    }
  }else{
    let statusStr = "";
    if(ehsNoticeInfoForm.ehsNoticeInfo.status=="0"){
      statusStr = "草稿";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="2"){
      statusStr = "已审核";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="3"){
      statusStr = "已签收";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="4"){
      statusStr = "整改中";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="5"){
      statusStr = "待复查";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="6"){
      statusStr = "复查完成";
    }else if(ehsNoticeInfoForm.ehsNoticeInfo.status=="11"){
      statusStr = "审核已退回";
    }
    warningMessage('当前为'+statusStr+'状态，不能审核！')
  }
  visibleNo.value = false;
}

getDictData();
//获取字典分类
async function getDictData() {
  let params = {};
  let res = await defHttp.get({
    url: '/sys/dict/getDictItems/notice_info_type',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    noticeInfoType.value = [...res.result];

  } else {
    console.log('数根节点查询结果异常', res);
  }
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
  // let params = {
  // };
  // let res = await defHttp.get({
  //   url: '/sys/common/getOnlinePreviewDomain',
  //   params
  // }, {isTransformResponse: false});
  // if (res.success && res.result) {
  //   window.open(res.result+"?url="+encodeURIComponent(Base64.encode(file.url)), '_blank');
  // } else {
  //   console.log('数根节点查询结果异常', res);
  // }

};
</script>


<style lang="less" scoped>
.STYLE1 {
  font-family: "宋体";
  font-weight: bold;
  font-size: 24px;
}

.STYLE2 {
  font-family: "宋体";
  font-weight: bold;
  font-size: 20px;
}

.STYLE3 {
  font-family: "宋体";
  font-size: 13px;
  font-weight: bold;
}

.STYLE4 {
  font-family: "宋体";
  font-size: 18px;
  font-weight: bold;
}

.STYLE6 {
  font-family: "宋体";
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

.div-css {
  border: 1px solid #4a5569;
  width: 720px;
  height: 100%;
  position: absolute;
  left: 50%;
  margin-left: -360px
}

.input1 {
  width: 200px;
  height: 28px;
  border: none;
  border-bottom: 1px solid #999;
  background-color: transparent;
  outline: none;
  font-size: 20px;
}

.input2 {
  width: 650px;
  height: 28px;
  border: none;
  border-bottom: 1px solid #999;
  background-color: transparent;
  outline: none;
  font-size: 13px;
}
.custom-class {
  color: red;
}
.ant-form-item-label > label{
  font-size: 13px;
}

.ant-select {
  font-size: 13px;
}
.ant-radio-wrapper{
  font-size: 13px;
}
</style>
