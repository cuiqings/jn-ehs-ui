<template>
  <BasicDrawer v-bind="$attrs" @register="registerModal" destroyOnClose :title="title" :width="800" @ok="handleSubmit">

    <a-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
      <img alt="example" style="width: 100%" :src="previewImage" />
    </a-modal>
    <div style="text-align: center;margin:30px 0px;">
      <table width="750"  cellpadding="0" cellspacing="0" style="margin:auto; border-collapse:collapse;table-layout: fixed;">
        <tbody>
        <tr>
          <td style="width:75px; margin-top: 1px;">
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
                  list-type="picture-card"
                  v-model:file-list="item.img"
                  :max-count="10"
                  @preview="handlePreview"
                  disabled
                >
                </a-upload>
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
                list-type="picture-card"
                v-model:file-list="signatureImg"
                :max-count="10"
                @preview="handlePreview"
                disabled
              >
              </a-upload>
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
                v-model:file-list="recipientSignImg"
                :max-count="10"
                @preview="handlePreview"
                disabled
              >
              </a-upload>
            </div>
            <div style="font-weight: normal;float: right;margin-top: 70px;margin-right: 10px">
              {{ dayjs(noticeModel.receiveTime).format('YYYY年 MM月 DD日 HH:mm') }}
            </div>
          </td>
        </tr>
        <tr v-show="type1||type2||type3" height="28" style="height:21.00pt;  border: 1px solid #000;">
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
                    list-type="picture-card"
                    v-model:file-list="item.img"
                    :max-count="10"
                    @preview="handlePreview"
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
                </div>
                <div v-show="index+1 == noticeModel.correctionList.length" style="position: absolute;right: 0;bottom: 0; display: inline-block;width:240px;margin-bottom: 10px;">
                  <div>
                    签字：
                    <a-upload
                      list-type="picture-card"
                      v-model:file-list="correctorSignImg"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    >
                    </a-upload>
                  </div>
                  <div style="font-weight: normal;float: right;margin-right: 10px">
                    {{ dayjs(noticeModel.correctorTime).format('YYYY年 MM月 DD日 HH:mm') }}
                  </div>
                </div>
              </div>
            </div>

          </td>
        </tr>

        <tr v-show="type1||type2||type3" height="28" style="height:21.00pt;  border: 1px solid #000;">
          <td class="STYLE3" style="text-align: center;border:1px solid #000;">复查结果</td>
          <td colspan="5" class="STYLE3" style="font-weight:normal;text-align: left;">
            <div v-for="(item,index) in noticeModel.correctionList" :key="item.id">
              <div v-if="item.status != '0'">
              <div>
                第{{index+1}}次复查结果：
              </div>
              <div>
                &nbsp;
                {{ item.reviewOpinion }}
              </div>
              <div :style="{'position': 'relative','min-height': index+1 == noticeModel.correctionList.length? '180px': '0'}">
                <div style="display: inline-block;width:340px;">
                  <a-upload
                    list-type="picture-card"
                    v-model:file-list="item.reviewImg"
                    :max-count="10"
                    @preview="handlePreview"
                    disabled
                  >
                  </a-upload>
                </div>
                <div v-show="index+1 == noticeModel.correctionList.length" style="position: absolute;right: 0;bottom: 0; display: inline-block;width:240px;margin-bottom: 10px;">
                  <div>
                    签字：
                    <a-upload
                      list-type="picture-card"
                      v-model:file-list="reviewSignImg"
                      :max-count="10"
                      @preview="handlePreview"
                      disabled
                    >
                    </a-upload>
                  </div>
                  <div style="font-weight: normal;float: right;margin-right: 10px">
                    {{ dayjs(noticeModel.reviewTime).format('YYYY年 MM月 DD日 HH:mm')}}
                  </div>
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

    <div v-show="titleCode === '5' && noticeModel.correctionList.length>0">
    <div class="model-title">整改复查</div>
    <a-form :model="noticeModel" layout="horizontal" :label-col="{xs: {span: 24}, sm: {span: 6}}" :wrapper-col="{xs: {span: 24}, sm: {span: 18}}">
      <a-collapse v-model:activeKey="activeKey">
        <a-collapse-panel v-for="(item,index) in noticeModel.correctionList" :key="item.id" :header="`第${index+1}次整改复查`">
        <a-row>
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" name="correctorName" label="整改责任人">
              <a-input v-model:value="item.correctorName" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" name="correctionFeedback" label="反馈内容">
              <a-textarea :rows="4" v-model:value="item.correctionFeedback" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="19">
            <a-form-item :wrapperCol="{ span: 20,offset:5 }">
              <a-upload
                list-type="picture-card"
                v-model:file-list="item.img"
                :max-count="10"
                @preview="handlePreview"
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
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <div style="position: absolute;bottom: 15px;" >{{item.createTime}}</div>
          </a-col>
        </a-row>
        <a-row>
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" name="auditName" label="复查人">
              <a-input v-model:value="item.auditName" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" name="reviewOpinion" label="复查结果">
              <a-textarea :rows="4" v-model:value="item.reviewOpinion" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="19">
            <a-form-item :wrapperCol="{ span: 20,offset:5 }">
            <a-upload
              list-type="picture-card"
              v-model:file-list="item.reviewImg"
              :max-count="10"
              @preview="handlePreview"
              disabled
            >
            </a-upload>
            </a-form-item>
          </a-col>
          <a-col :span="5">
            <div style="position: absolute;bottom: 25px;" >{{item.updateTime}}</div>
          </a-col>
        </a-row>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
    </div>
    <div v-show="titleCode === '5' && noticeModel.extensionList.length>0">
    <div>
      <div class="model-title">延期记录</div>
    </div>
    <a-form :model="noticeModel" layout="horizontal" :label-col="{xs: {span: 24}, sm: {span: 6}}" :wrapper-col="{xs: {span: 24}, sm: {span: 18}}">
      <a-collapse v-model:activeKey="activeExtensionKey">
      <a-collapse-panel v-for="(item,index) in noticeModel.extensionList" :key="item.id" :header="`第${index+1}次延期审核`">
        <a-row>
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="延期日期">
              <a-input v-model:value="item.extensionTime" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="延期原因">
              <a-textarea :rows="3" v-model:value="item.reson" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row>
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="申请人">
              <a-input v-model:value="item.extensionName" placeholder="请输入" :suffix="item.createTime" disabled/>
            </a-form-item>
          </a-col>
<!--          <a-col :span="5">-->
<!--            <div style="position: absolute;bottom: 30px;" >{{item.createTime}}</div>-->
<!--          </a-col>-->
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="同意延期">
              <a-input v-model:value="item.passTime" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="审核说明">
              <a-textarea :rows="3" v-model:value="item.auditStatement" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
        </a-row>
        <a-row v-show="item.status != '0'">
          <a-col :span="24">
            <a-form-item :labelCol="{ span: 4 }" :wrapperCol="{ span: 20 }" label="审核人">
              <a-input v-model:value="item.auditName" :suffix="item.updateTime" placeholder="请输入" disabled/>
            </a-form-item>
          </a-col>
<!--          <a-col :span="5">-->
<!--            <div style="position: absolute;bottom: 30px;" >{{item.updateTime}}</div>-->
<!--          </a-col>-->
        </a-row>
      </a-collapse-panel>
      </a-collapse>
    </a-form>
    </div>
  </BasicDrawer>
</template>

<script lang="ts" setup>
  import {ref, computed, unref, reactive} from 'vue';
import {BasicForm, useForm} from '/@/components/Form/index';
import { PlusOutlined } from '@ant-design/icons-vue';
import { BasicDrawer, useDrawerInner } from '/src/views/notice/components/Drawer';
import {formSchema} from '../EhsNoticeInfo.data';
import {saveOrUpdate} from '../EhsNoticeInfo.api';
import {defHttp} from "/@/utils/http/axios";
  import {picPreviewUrl, previewFile} from "/@/api/common/api";
import dayjs, { Dayjs } from 'dayjs';
  import {render} from "/@/utils/common/renderUtils";
  import {UploadProps} from "ant-design-vue";
// Emits声明
const emit = defineEmits(['register','success']);
const isUpdate = ref(true);
const titleCode = ref('1');
const activeKey = ref([]);
const activeExtensionKey = ref([]);
const noticeModel = reactive({
  correctionList: [],
  extensionList: [],
});
const offlineFileList = ref<UploadProps['fileList']>([]);
let signatureImg = ref<UploadProps['fileList']>([]);//签发人
let recipientSignImg = ref<UploadProps['fileList']>([]);//接收单位签字
let correctorSignImg = ref<UploadProps['fileList']>([]);//整改人
let reviewSignImg = ref<UploadProps['fileList']>([]);//复查人
let correctionList;
//通知类型
const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const demandName = ref("");
const typeNameTip = ref("");
const controlDt = ref("");
const endDtName = ref('整改期限');

//表单赋值
const [registerModal, {setDrawerProps, closeDrawer}] = useDrawerInner(async (data) => {
  titleCode.value = data.titleCode;
  setDrawerProps({
    confirmLoading: false,
    showCancelBtn:!!data?.showFooter,
    showOkBtn:!!data?.showFooter
  });
  //加载预览内容
  Object.assign(noticeModel,data.record);
  controlDt.value =  dayjs(data.record.controlStartDt).format('YYYY-MM-DD HH:mm') + "  --  " +  dayjs(data.record.controlEndDt).format('YYYY-MM-DD HH:mm');
  noticeModel.type = noticeModel.title + render.renderDict(noticeModel.type, 'notice_info_type').children;
  typeSelectChange(data.record.type);
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
  if(noticeModel.reviewSign != "" && noticeModel.reviewSign != null){
    reviewSignImg.value = [];
    reviewSignImg.value.push({
      uid: Math.random(),
      name: noticeModel.reviewSign,
      status: 'done',
      url: noticeModel.reviewSign
    })
  }
  let proUrl = '/notice/ehsNoticeProblem/listByInfoId';
  //加载问题列表
  await defHttp.get({url: proUrl,params: {'noticeInfoId': data.record.id}}).then(res => {
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
//加载整改记录
  let url = '/notice/ehsNoticeCorrection/listByInfoId';
  await defHttp.get({url: url,params: {'noticeInfoId': data.record.id,}}).then(res => {
    correctionList = res;
    noticeModel.correctionList = [];
    if(res.length > 0){
      res.forEach(item=>{
        let modolItem = Object.assign({}, item);
        if(modolItem.img != "" && modolItem.img != null){
          modolItem.img = modolItem.img.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.img = [];
        }
        if(modolItem.attachment != "" && modolItem.attachment != null){
          modolItem.attachment = modolItem.attachment.split(",").map(e => {
            return {
              uid: Math.random(),
              name: e.split("/")[e.split("/").length-1],
              status: 'done',
              path: e,
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.attachment = [];
        }
        if(modolItem.reviewImg != "" && modolItem.reviewImg != null){
          modolItem.reviewImg = modolItem.reviewImg.split(",").map(e => {
            return {
              uid: Math.random(),
              name: 'image.png',
              status: 'done',
              url: picPreviewUrl + e
            }
          });
        }else{
          modolItem.reviewImg = [];
        }
        modolItem.correctorName = data.record.correctorName;
        noticeModel.correctionList.push(modolItem);
      });
    }
  });
  let extensionurl = '/notice/ehsNoticeExtension/listByInfoId';
  await defHttp.get({url: extensionurl,params: {'noticeInfoId': data.record.id}}).then(res => {
    noticeModel.extensionList = [];
    if(res.length>0){
      res.forEach(item=>{
        let modolItem = Object.assign({}, item);
        if(modolItem.passTime != "" && modolItem.passTime != null) {
          modolItem.passTime = dayjs(modolItem.passTime).format('YYYY年MM月DD日');
        }
        if(modolItem.extensionTime != "" && modolItem.extensionTime != null) {
          modolItem.extensionTime = dayjs(modolItem.extensionTime).format('YYYY年MM月DD日');
        }
        noticeModel.extensionList.push(modolItem);
      })
    }
  });
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
    typeNameTip.value="";
    endDtName.value="反馈期限";
  }else if(type==4){
    type1.value = false;
    type2.value = false;
    type3.value = false;
    type4.value = true;
    type5.value = false;
    demandName.value="针对上述问题，进行考核：";
    typeNameTip.value="考核问题："
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

//设置标题
const title = computed(() => ('通知书查看'));
//表单提交事件
async function handleSubmit(v) {
  // try {
    // let values = await validate();
  //   setDrawerProps({confirmLoading: true});
  //   //提交表单
  //   await saveOrUpdate(values, isUpdate.value);
  //   //关闭弹窗
  //   closeDrawer();
  //   //刷新列表
  //   emit('success');
  // } finally {
  //   setDrawerProps({confirmLoading: false});
  // }
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
const handleCancel = () => {
  previewVisible.value = false;
  previewTitle.value = '';
};
</script>

<style lang="less" scoped>
/** 时间和数字输入框样式 */
:deep(.ant-input-number){
  width: 100%
}

:deep(.ant-calendar-picker){
  width: 100%
}

tr > td{
  padding: 5px;
}

.STYLE1 { font-family: "宋体"; font-weight: bold; font-size: 24px; }
.STYLE2 { font-family: "宋体";font-weight: bold; font-size: 20px;}
.STYLE3 { font-family: "宋体"; font-size: 16px; font-weight:bold;}
.STYLE4 { font-family: "宋体"; font-size: 18px; font-weight:bold;}
.STYLE6 { font-family: "宋体"; font-size: 12px; font-weight:bold;}

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
