<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">
<!--    <BasicForm @register="registerForm"/>-->
    <template #centerFooter1>
      <a-button v-if="titleCode === '4'" color="warning" :loading="nopassIsLoading" @click="noPass">不通过</a-button>
    </template>
    <template #centerFooter2>
      <a-button type="primary" @click="handleSubmit" class="mr-2" :loading="confirmLoading">
        {{ submitText }}
      </a-button>
    </template>
    <div style="text-align: center;margin:30px 0px;">
      <table width="750"  cellpadding="0" cellspacing="0" style="margin:auto; border-collapse:collapse;table-layout: fixed;">
        <tbody>
        <tr>
          <td style="width: 75px; margin-top: 1px;">
            <img src="/resource/img/logo.png" style="width: 75px;" alt="">
          </td>
          <td style="width:700px;">
            <div class="STYLE1" style="text-align: center;margin-right:25px;">中信重工公司</div>
            <div class="STYLE2" style="text-align: center;margin-right:25px;">{{ noticeModel.type }}</div>
          </td>
        </tr>

        <tr>
          <td>
            <div class="STYLE3" style="width:750px;text-align: right;">编号: {{ noticeModel.noticeNo }}</div>
          </td>
        </tr>
        </tbody>
      </table>
      <table width="750" cellpadding="0" cellspacing="0" bordercolor="#000000" style="margin:auto; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
        <tbody>
        <tr height="1"  width="750" style="border: 1px solid #000;" >
          <td colspan="5"  class="STYLE2" style="text-align: left;">&nbsp;{{ noticeModel.receiveOrgName }}:</td>
        </tr>
        <tr v-if="noticeModel.entryMethod==1" height="30"  width="750" style="height:21.00pt; border: 1px solid #000;" >
          <td colspan="6"  class="STYLE3" style="font-weight:normal;text-align: left;">
            <div v-show="type1||type4">&nbsp;&nbsp;&nbsp;&nbsp;{{typeNameTip}}</div>
            <div v-show="type1||type4" v-for="(item,index) in noticeModel.problemList" :key="item.id">
              <div style="margin-left: 10px">{{index+1}}、{{ item.problemContent }}</div>
              <div style="margin-left: 20px">
                <a-upload
                  :action="uploadAction"
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="item.img"
                  :max-count="10"
                  @preview="handlePreview"
                  @change="handleReviewChange"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
            </div>
            <div v-show="type2||type3||type5">&nbsp;&nbsp;{{noticeModel.noticeContent}}</div>
          </td>
        </tr>
        <tr v-if="noticeModel.entryMethod==2" height="28" style="height:30.00pt;  border: 1px solid #000;">
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
        <tr v-if="noticeModel.entryMethod==1" height="28" style="height:30.00pt;  border: 1px solid #000;">
          <td class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
          <td colspan="5" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div>{{demandName}}</div>
            <div>&nbsp;&nbsp;{{ noticeModel.content }}</div>
          </td>
        </tr>
        <tr v-show="type1||type2||type3" height="28" style="height:21.00pt;  border: 1px solid #000;">
          <td class="STYLE3" style="text-align: center;border:1px solid #000;">{{endDtName}}</td>
          <td colspan="5" class="STYLE3" style="font-weight:normal;text-align: left;">
            &nbsp;
            {{ dayjs(noticeModel.endDt).format('YYYY年MM月DD日') }}
          </td>
        </tr>
        <tr v-show="type3" height="28" style="height:21.00pt;  border: 1px solid #000;">
          <td class="STYLE3" style="text-align: center;border:1px solid #000;">管控时间</td>
          <td colspan="5" class="STYLE3" style="font-weight:normal;text-align: left;">
            &nbsp;
            {{ controlDt }}
          </td>
        </tr>
        <tr height="50" style="height:21.00pt;">
          <td colspan="3" class="STYLE3" style="text-align: left; border:1px solid #000;">
            <div style="margin-top: 5px;margin-left: 5px">
              签发人签字：
            </div>
            <div style="width: 30px;height: 30px;margin-left: 15px">
              <a-upload
                :action="uploadAction"
                list-type="picture-card"
                :headers="headers"
                v-model:file-list="signatureImg"
                :max-count="10"
                @preview="handlePreview"
                @change="handleReviewChange"
                disabled
              >
              </a-upload>
              <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                <img alt="example" style="width: 100%" :src="previewImage" />
              </a-modal>
            </div>
            <div style="font-weight: normal;float: right;margin-top: 70px;margin-right: 10px">
              {{ dayjs(noticeModel.initiatorTime).format('YYYY年 MM月 DD日 HH:mm') }}
            </div>
          </td>
          <td colspan="3" class="STYLE3" style="text-align: left;">
            <div style="margin-top: 5px;margin-left: 5px">
              接收单位签字：
            </div>
            <div style="width: 30px;height: 30px;margin-left: 15px">
              <a-upload
                list-type="picture-card"
                :headers="headers"
                v-model:file-list="recipientSignImg"
                :max-count="10"
                @preview="handlePreview"
                disabled
              >
              </a-upload>
              <a-modal :visible="previewVisible" :footer="null" @cancel="imgCancel(item)">
                <img alt="example" style="width: 100%" :src="previewImage" />
              </a-modal>
            </div>
            <div style="font-weight: normal;float: right;margin-top: 70px;margin-right: 10px">
              {{ dayjs(noticeModel.receiveTime).format('YYYY年 MM月 DD日 HH:mm') }}
            </div>
          </td>
        </tr>
        <tr v-if="noticeModel.isCorrection" height="28" style="height:21.00pt;  border: 1px solid #000;">
          <td class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
          <td colspan="5" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div v-for="(item,index) in noticeModel.correctionList" :key="item.id">
            <div>
              第{{index+1}}次整改反馈：
            </div>
            <div>
              &nbsp;
              {{ item.correctionFeedback }}
            </div>
            <div :style="{'position': 'relative','min-height': index+1 == noticeModel.correctionList.length? '180px': '0'}">
              <div style="display: inline-block;width:340px;">
                <a-upload
                  :action="uploadAction"
                  list-type="picture-card"
                  :headers="headers"
                  v-model:file-list="item.img"
                  :max-count="10"
                  @preview="handlePreview"
                  @change="handleReviewChange"
                  disabled
                >
                </a-upload>
                <a-upload
                  v-model:file-list="item.attachment"
                  name="file"
                  :max-count="1"
                  @preview="handleFilePreview"
                  :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
                  disabled
                >
                </a-upload>
                <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                  <img alt="example" style="width: 100%" :src="previewImage" />
                </a-modal>
              </div>
              <div v-show="index+1 == noticeModel.correctionList.length" style="position: absolute;right: 0;bottom: 0; display: inline-block;width:240px;margin-bottom: 10px;">
                <div>
                  签字：
                  <a-upload
                    :action="uploadAction"
                    list-type="picture-card"
                    :headers="headers"
                    v-model:file-list="correctorSignImg"
                    :max-count="10"
                    @preview="handlePreview"
                    @change="handleReviewChange"
                    disabled
                  >
                  </a-upload>
                  <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
                    <img alt="example" style="width: 100%" :src="previewImage" />
                  </a-modal>
                </div>
                <div style="font-weight: normal;float: right;margin-right: 10px">
                  {{ dayjs(noticeModel.correctorTime).format('YYYY年 MM月 DD日 HH:mm') }}
                </div>
              </div>
            </div>
            </div>

          </td>
        </tr>
        </tbody>
      </table>
      <div style="text-align:left;" v-if="noticeModel.entryMethod==1">
        <div class="ant-row ant-form-item" style="row-gap: 0px;">
        <div style="font-weight: normal;margin-top: 8px;margin-left: 10px">
          附件
        </div>
        <a-upload
          v-model:file-list="offlineFileList"
          name="file"
          :max-count="1"
          @preview="handleFilePreview"
          :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
          disabled
        ></a-upload>
        </div>
      </div>
    </div>

    <div v-show="titleCode === '1'">
      <div class="model-title">整改反馈</div>
      <a-form ref="formEl" :model="planModel" layout="vertical" :label-col="{xs: {span: 24}, sm: {span: 6}}" :wrapper-col="{xs: {span: 24}, sm: {span: 18}}">
        <a-row>
          <a-col :span="24">
            <a-form-item :rules="[{ required: true, message: '请填写整改反馈！' }]" :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" name="correctionFeedback" label="整改反馈">
              <a-textarea :rows="4" v-model:value="planModel.correctionFeedback" placeholder="请输入" show-count :maxlength="300"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-upload
            :action="uploadAction"
            list-type="picture-card"
            :headers="headers"
            v-model:file-list="imgList"
            :max-count="10"
            :data="{'biz': 'noticeCorrection'}"
            :before-upload="beforeUploadImg"
            @preview="handlePreview"
            :multiple="true"
            @change="handleChange"
          >
            <div v-if="imgList.length < 10">
              <plus-outlined />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
          <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
        </a-row>
        <a-row>
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :action="uploadAction"
            :headers="headers"
            :data="{'biz': 'noticeCorrection'}"
            :max-count="1"
            :before-upload="beforeUploadFile"
            @change="handlefileChange"
            @preview="handleFilePreview"
            :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
          >
            <a-button>
              <upload-outlined></upload-outlined>
              添加附件
            </a-button>
          </a-upload>
        </a-row>
      </a-form>
    </div>
    <div v-show="titleCode === '4'">
      <div class="model-title">整改复查</div>
      <a-form ref="reviewformEl" :model="reviewModel" layout="vertical" :label-col="{xs: {span: 24}, sm: {span: 6}}" :wrapper-col="{xs: {span: 24}, sm: {span: 18}}">
        <a-row>
          <a-col :span="24">
            <a-form-item :rules="[{ required: true, message: '请填复查意见！' }]" :labelCol="{ span: 4 }" :wrapperCol="{ span: 24 }" name="reviewOpinion" label="复查意见">
              <a-textarea :rows="4" v-model:value="reviewModel.reviewOpinion" placeholder="请输入" show-count :maxlength="300"/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-upload
            :action="uploadAction"
            list-type="picture-card"
            :headers="headers"
            v-model:file-list="reviewImgList"
            :max-count="10"
            :data="{'biz': 'noticeCorrection'}"
            :before-upload="beforeUploadImg"
            @preview="handlePreview"
            :multiple="true"
            @change="handleReviewChange"
          >
            <div v-if="reviewImgList.length < 10">
              <plus-outlined />
              <div class="ant-upload-text">Upload</div>
            </div>
          </a-upload>
          <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
            <img alt="example" style="width: 100%" :src="previewImage" />
          </a-modal>
        </a-row>
      </a-form>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
import {defineComponent,ref,reactive, computed, unref} from 'vue';
import {BasicForm, useForm} from '/@/components/Form/index';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
import { PlusOutlined,UploadOutlined } from '@ant-design/icons-vue';
import type {UploadChangeParam, UploadProps, FormInstance} from 'ant-design-vue';
import {message, Upload} from 'ant-design-vue';
import {formSchema} from '../EhsNoticeInfo.data';
import {saveOrUpdate} from '../EhsNoticeInfo.api';
import {uploadUrl, picPreviewUrl, previewFile} from '/src/api/common/api.ts';
import {defHttp} from "/@/utils/http/axios";
import { getToken } from '/@/utils/auth';
import type { Rule } from 'ant-design-vue/es/form';
import { ValidateErrorEntity } from 'ant-design-vue/lib/form/interface';
import {render} from '/@/utils/common/renderUtils';
import dayjs, { Dayjs } from 'dayjs';
import {useUserStore} from "/@/store/modules/user";
import {useMessage} from "/@/hooks/web/useMessage";
const { createMessage } = useMessage();
// Emits声明
const emit = defineEmits(['register','success']);
const isUpdate = ref(true);
const submitText = ref("");
const nopassIsLoading = ref(false);
const confirmLoading = ref(false);
const titleCode = ref('1');
//通知类型
const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const demandName = ref("");
const typeNameTip = ref("");
//表单modal
const planModel = reactive({ });
const formEl = ref<FormInstance>();
const reviewformEl = ref<FormInstance>();
const reviewModel = reactive({ });
let noticeInfo;//grid表格传过来的通知信息
const noticeModel = reactive({ });//word表格展示内容
let correctionList = [];
const offlineFileList = ref<UploadProps['fileList']>([]);
let signatureImg = ref<UploadProps['fileList']>([]);//签发人
let recipientSignImg = ref<UploadProps['fileList']>([]);//接收单位签字
let correctorSignImg = ref<UploadProps['fileList']>([]);//整改人
//图片上传
const uploadAction = uploadUrl;
const imgList = ref<UploadProps['fileList']>([]);
const reviewImgList = ref<UploadProps['fileList']>([]);
const fileList = ref<UploadProps['fileList']>([]);
const headers = { 'X-Access-Token': getToken() };
const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const controlDt = ref("");
const endDtName = ref('整改期限');

//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {

//重置表单
  formEl.value.resetFields();
  reviewformEl.value.resetFields();
  imgList.value = [];
  reviewImgList.value = [];
  reviewModel.reviewOpinion="";
  planModel.correctionFeedback="";
  // await resetFields();
  isUpdate.value = !!data?.isUpdate;
  titleCode.value = data.titleCode;
  if (unref(titleCode) == '1'){
    submitText.value = '提交';
  }else if(unref(titleCode) == '4'){
    submitText.value = '复查通过';
  }
  setDrawerProps({
    okText: submitText.value,
    confirmLoading: false,
    showCancelBtn: !!data?.showFooter,
    showOkBtn: false,
    destroyOnClose: true,
  });
  //加载整改记录
  let url = '/notice/ehsNoticeCorrection/listByInfoId';
  await defHttp.get({url: url,params: {'noticeInfoId': data.record.id}}).then(res => {
    correctionList = res;
    noticeModel.correctionList = [];
    if(res.length > 0){
      res.forEach(item=>{
        let correction = Object.assign({}, item);
        if(correction.img != "" && correction.img != null){
          correction.img = correction.img.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        } else {
          correction.img = [];
        }
        if(correction.attachment != "" && correction.attachment != null){
          correction.attachment = correction.attachment.split(",").map(e => {
            return {
              uid: Math.random(),
              name: e.split("/")[e.split("/").length-1],
              status: 'done',
              path: e,
              url: picPreviewUrl + e
            }
          });
        }else{
          correction.attachment = [];
        }
        noticeModel.correctionList.push(correction);
      });
      noticeModel.isCorrection = true;
    }else{
      noticeModel.isCorrection = false;
    }
  });
  if (unref(isUpdate)) {
    noticeInfo = Object.assign({}, data.record);
    Object.assign(noticeModel,data.record);
    controlDt.value =  dayjs(data.record.controlStartDt).format('YYYY-MM-DD HH:mm') + "  --  " +  dayjs(data.record.controlEndDt).format('YYYY-MM-DD HH:mm');
    noticeModel.type = noticeModel.title + render.renderDict(noticeInfo.type, 'notice_info_type').children;
    //通知书录入：附件线下发
    if(data.record.attachment != ""&&data.record.attachment != null){
      const attachment = data.record.attachment;
      const attachmentArry = attachment.split(",");
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
    if(noticeModel.signature != "" && noticeModel.signature != null){
      if(noticeModel.signature.indexOf("data:image/png;base64")==0){
        signatureImg.value = [];
        signatureImg.value.push({
          uid: Math.random(),
          name: noticeModel.signature,
          status: 'done',
          path: noticeModel.signature,
          url: noticeModel.signature
        })
      }else{
        signatureImg.value = noticeModel.signature.split(",").map(e=>{
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
              name: e,
              status: 'done',
              path: e,
              url: picPreviewUrl + e
            }
          }
        })
      }
    }
    if(noticeModel.recipientSign != "" && noticeModel.recipientSign != null){
      if(noticeModel.recipientSign.indexOf("data:image/png;base64")==0){
        recipientSignImg.value = [];
        recipientSignImg.value.push({
          uid: Math.random(),
          name: noticeModel.recipientSign,
          status: 'done',
          path: noticeModel.recipientSign,
          url: noticeModel.recipientSign
        })
      }else{
        recipientSignImg.value = noticeModel.recipientSign.split(",").map(e=>{
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
              name: e,
              status: 'done',
              path: e,
              url: picPreviewUrl + e
            }
          }
        })
      }
    }
    if(noticeModel.correctorSign != "" && noticeModel.correctorSign != null){
      correctorSignImg.value = [];
      correctorSignImg.value.push({
        uid: Math.random(),
        name: noticeModel.correctorSign,
        status: 'done',
        url: noticeModel.correctorSign
      })
    }
    typeSelectChange(data.record.type);
    let url = '/notice/ehsNoticeProblem/listByInfoId';
    //加载问题列表
    await defHttp.get({url: url,params: {'noticeInfoId': data.record.id}}).then(res => {
      res.forEach(e => {
        if(e.img != "" && e.img != null){
          e.img = e.img.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          })
        }else{
          e.img = [];
        }
      });
      noticeModel.problemList = res.length > 0 ? res : [];
    });
  }
});
//设置标题
const title = computed(() => {
  if (unref(titleCode) == '1'){
    return '通知书问题整改';
  }else if(unref(titleCode) == '4'){
    return '通知书问题整改'
  }else if(unref(titleCode) == '5'){
    return '通知书查看'
  }else{
    return ''
  }
});

function typeSelectChange(type) {
  if(type==1){
    type1.value = true;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value="针对上述问题，整改要求如下：";
    typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    endDtName.value="整改期限";
  }else if(type==2){
    type1.value = false;
    type2.value = true;
    type3.value = false;
    type4.value = false;
    type5.value = false;
    demandName.value="针对上述预警内容，整改要求如下：";
    typeNameTip.value="";
    endDtName.value="整改期限";
  }else if(type==3){
    type1.value = false;
    type2.value = false;
    type3.value = true;
    type4.value = false;
    type5.value = false;
    demandName.value="针对上述管控内容，整改要求如下：";
    typeNameTip.value=""
  }else if(type==4){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    demandName.value="针对上述问题，进行考核：";
    typeNameTip.value="考核问题：";
    endDtName.value="反馈期限";
  }else if(type==5){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = false;
    type5.value = true;
    demandName.value="";
    typeNameTip.value="";
  }
}

//表单提交事件
async function handleSubmit(v) {
  if(unref(titleCode) == '1'){
    formEl.value.validate().then(async() => {
      // if(userinfo.value.signature == '' || userinfo.value.signature== undefined){
      //   createMessage.error(`请先在app端上传签名！`);
      //   return false;
      // }
      try {
        confirmLoading.value = true;
        //表单数据封装
        let formData = Object.assign({}, planModel);
        formData.noticeInfoId = noticeInfo.id;
        formData.img = imgList.value.map(e=>{
          return e.path;
        }).join(',');
        formData.attachment = fileList.value.map(e=>{
          return e.path;
        }).join(',');
        formData.status = '0';
        // await saveOrUpdate(formData,unref(isUpdate));
        let url = '/notice/ehsNoticeCorrection/add';
        await defHttp.post({url: url,params: formData});
        let infourl = '/notice/ehsNoticeInfo/correctionEdit';
        let infoFormData = {'id': noticeInfo.id,'status': '4','correctorTime': dayjs(),'correctorSign':userinfo.value.signature};
        await defHttp.post({url: infourl,params: infoFormData},{successMessageMode: 'none'});
        //关闭弹窗
        closeDrawer();
        //刷新列表
        emit('success');
      } finally {
        confirmLoading.value = false;
      }
    }).catch((error: ValidateErrorEntity<any>) => {
      console.log('error', error);
    })
  }else if(unref(titleCode) == '4'){//pass
    reviewformEl.value.validate().then(async() => {
      // if(userinfo.value.signature == '' || userinfo.value.signature== undefined){
      //   createMessage.error(`请先在app端上传签名！`);
      //   return false;
      // }
      try {
        confirmLoading.value = true;
        //表单数据封装
        let formData = Object.assign({}, reviewModel);
        formData.id = correctionList[correctionList.length-1].id;
        formData.noticeInfoId = correctionList[0].noticeInfoId;
        formData.reviewImg = reviewImgList.value.map(e=>{
          return e.path;
        }).join(',');
        formData.auditUserId = userinfo.value.id;
        formData.auditName = userinfo.value.realname;
        formData.status = '1';
        //获取通知书类型字典
        let dicurl = '/sys/dict/getDictText/'+"notice_info_type/"+ noticeInfo.type;
        let infoTypeText = '';
        await defHttp.get({url: dicurl,params: {}}).then(res=>{
          infoTypeText = res;
        });
        formData.infoTypeText= infoTypeText;
        let url = '/notice/ehsNoticeCorrection/edit';
        await defHttp.post({url: url,params: formData});
        let infourl = '/notice/ehsNoticeInfo/correctionEdit';
        let infoFormData = {'id': noticeInfo.id,'status': '5',reviewTime: dayjs(),reviewSign: userinfo.value.signature};
        await defHttp.post({url: infourl,params: infoFormData},{successMessageMode: 'none'});
        //关闭弹窗
        closeDrawer();
        //刷新列表
        emit('success');
      } finally {
        confirmLoading.value = false;
      }
    }).catch((error: ValidateErrorEntity<any>) => {
      console.log('error', error);
    })
  }

}

//不通过点击事件
async function noPass(){
  reviewformEl.value.validate().then(async() => {
    // if(userinfo.value.signature == '' || userinfo.value.signature== undefined){
    //   createMessage.error(`请先在app端上传签名！`);
    //   return false;
    // }
    try {
      nopassIsLoading.value = true;
      //表单数据封装
      let formData = Object.assign({}, reviewModel);
      formData.id = correctionList[correctionList.length-1].id;
      formData.noticeInfoId = correctionList[0].noticeInfoId;
      formData.reviewImg = reviewImgList.value.map(e=>{
        return e.path;
      }).join(',');
      formData.auditUserId = userinfo.value.id;
      formData.auditName = userinfo.value.realname;
      // formData.auditName =  userinfo.value.post + '-' + userinfo.value.realname;
      formData.status = '2';
      //获取通知书类型字典
      let dicurl = '/sys/dict/getDictText/'+"notice_info_type/"+ noticeInfo.type;
      let infoTypeText = '';
      await defHttp.get({url: dicurl}).then(res=>{
        infoTypeText = res;
      });
      formData.infoTypeText= infoTypeText;
      let url = '/notice/ehsNoticeCorrection/edit';
      await defHttp.post({url: url,params: formData});
      let infourl = '/notice/ehsNoticeInfo/correctionEdit';
      let infoFormData = {'id': noticeInfo.id,'status': '3',reviewTime: dayjs(),reviewSign: userinfo.value.signature};
      await defHttp.post({url: infourl,params: infoFormData},{successMessageMode: 'none'});
      //关闭弹窗
      closeDrawer();
      //刷新列表
      emit('success');
    } finally {
      nopassIsLoading.value = false;
    }
  }).catch((error: ValidateErrorEntity<any>) => {
    console.log('error', error);
  })
}

function getBase64(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

const previewVisible = ref(false);
const previewImage = ref('');
const previewTitle = ref('');

const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};

const beforeUploadFile: UploadProps['beforeUpload'] = file => {
  const isLt300M = file.size / 1024 / 1024 < 300;
  const isPdf = file.type === 'application/pdf';
  const isDoc = file.type === 'application/msword';
  const isDocx = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (!isLt300M) {
    createMessage.error('文件过大，请不要超过300M！');
    return false || Upload.LIST_IGNORE;
  } else if (!isPdf && !isDoc && !isDocx) {
    createMessage.error(`文件格式错误，仅支持doc、docx、pdf格式!推荐pdf格式上传！`);
    return false || Upload.LIST_IGNORE;
  }
  return true;
};

const beforeUploadImg: UploadProps['beforeUpload'] = file => {
  const isPng = file.type === 'image/png';
  const isJpg = file.type === 'image/jpg';
  const isJpeg = file.type === 'image/jpeg';
  if (!isPng && !isJpg && !isJpeg) {
    createMessage.error(`${file.name} 文件格式错误，仅支持png、jpeg、jpg格式!`);
    return false || Upload.LIST_IGNORE;
  }
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const img: HTMLImageElement = document.createElement('img');
      img.src = reader.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        ctx.fillStyle = 'rgb(0,0,0,0.1)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.font = ctx.canvas.width / 20 + 'px Arial';
        ctx.fillText(`${userinfo.value.workNo} ${userinfo.value.realname} ${dayjs().format('YYYY-MM-DD')}`, 20, 20);
        canvas.toBlob(resolve);
      };
    };
  });
};

const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string;
  }
  previewImage.value = file.url || file.preview;
  previewVisible.value = true;
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1);
};

const handleFilePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
};

function handleReviewChange(info: UploadChangeParam) {
  if(Array.isArray(info.fileList) && info.fileList.length > 0){
    reviewImgList.value = info.fileList.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: 'image.png',
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: 'image.png',
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
    reviewImgList.value = []
  }
}
//整改反馈-图片上传事件
function handleChange(info: UploadChangeParam) {
  if(Array.isArray(info.fileList) && info.fileList.length > 0){
    imgList.value = info.fileList.map(e=>{
      if(e.status === 'done'){
        if(e.hasOwnProperty('url') && !e.hasOwnProperty('response')){
          return  {
            uid: Math.random(),
            name: 'image.png',
            path: e.path,
            status: 'done',
            url: e.url
          }
        }
        if(e.hasOwnProperty('response') && e.response.code === 200){
          return  {
            uid: Math.random(),
            name: 'image.png',
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
    imgList.value = []
  }
}
//整改反馈-文件上传事件
function handlefileChange(info: UploadChangeParam) {
  if(Array.isArray(info.fileList) && info.fileList.length > 0){
    fileList.value = info.fileList.map(e=>{
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
            name: e.name,
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
    fileList.value = []
  }
}

</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number){
  width: 100%
}

:deep(.ant-calendar-picker){
  width: 100%
}

.STYLE1 { font-family: "宋体"; font-weight: bold; font-size: 24px; }
.STYLE2 { font-family: "宋体";font-weight: bold; font-size: 20px;}
.STYLE3 { font-family: "宋体"; font-size: 16px; font-weight:bold;}
.STYLE4 { font-family: "宋体"; font-size: 18px; font-weight:bold;}
.STYLE6 { font-family: "宋体"; font-size: 12px; font-weight:bold;}

tr > td{
  padding: 5px;
}
父元素:after{content:".";clear:both;display:block;height:0;overflow:hidden;visibility:hidden;}

//蓝色标题
.model-title {
  margin-bottom: 20px;
  padding: 5px 4px;
  font-weight: bold;
  font-size: 14px;
  color: #333;
  background-color: rgb(242, 242, 242);
  &:before {
    content: '┃ ';
    color: rgba(35, 146, 255, 1);
  }
}
</style>
