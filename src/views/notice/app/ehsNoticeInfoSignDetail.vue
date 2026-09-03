<template>
  <div class="app-em-wrap" align="center">
    <a-row  justify="space-between" style="margin-top: 10px">
      <a-col :span="4">
        <div style="margin-left: 10px;">
          <img src="/resource/img/logo.png" style="width: 50px;" alt="">
        </div>
      </a-col>
      <a-col :span="20">
        <div style="margin: 0px 10px;">
          <div class="STYLE2">中信重工公司</div>
          <div class="STYLE4">{{item.title}}{{typeName}}</div>
        </div>
      </a-col>
    </a-row>
    <a-row justify="space-between">
      <a-col :span="24">
        <div class="STYLE3" style="float:right;margin-right: 10px;margin-top: -3px">{{item.noticeNo}}</div>
      </a-col>
    </a-row>
    <table cellpadding="0" cellspacing="0" bordercolor="#000000" style="width:98%;margin:auto; border-collapse:collapse;table-layout: fixed;border:2px solid #000;">
      <tbody>
      <tr style="height:30px; border: 1px solid #000;" >
        <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
          {{item.receiveOrgName}}:
        </td>
      </tr>
      <tr v-if="item.entryMethod == '1'">
        <td v-if="type1||type4" colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
          <div class="STYLE3" style="margin-left: 50px">
            {{typeNameTip}}
          </div>
          <div
            v-for="(info, index1) in item.enpInfo"
            :key="info.id"
            style="margin-bottom: 8px;margin-left: 10px"
            align="baseline">
            <van-row>
              <span>{{index1+1}}.{{info.problemContent}}</span>
            </van-row>
            <van-row>
              <div  v-for="(imgItem, index2) in info.imgList" :key="imgItem.id">
                <img style="width: 50px;height: 50px" :src="imgItem">
              </div>
            </van-row>
          </div>
        </td>
        <td v-if="type2||type3||type5" colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
          <div class="STYLE3" style="margin-left: 50px">
            {{typeNameTip}}
          </div>
          <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
            {{item.noticeContent}}
          </div>
        </td>
      </tr>

      <tr v-if="item.entryMethod==2">
        <td colspan="12" class="STYLE3" style="font-weight:normal;text-align: left;">
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

      <tr v-if="item.entryMethod==1" style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
        <td colspan="10" class="STYLE3" style="font-weight:normal;text-align: justify; word-break: break-all;" >{{ item.content }}</td>
      </tr>
      <tr v-show="type1||type2||type3" style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">整改期限</td>
        <td colspan="10" class="STYLE3" style="font-weight:normal;text-align: left;">{{ item.endDt }}</td>
      </tr>
      <tr style="height:100%; border: 1px solid #000;">
        <td colspan="6" class="STYLE3" style="text-align: left; border:1px solid #000;">
          <div style="margin-top: 5px;margin-left: 5px">
            签发人签字：
          </div>
          <div v-show="null != item.signature && '' != item.signature" style="margin-left: 15px">
            <img style="width: 50px;height: 50px;" :src="checkSignature(item.signature)">
          </div>
          <div style="float: right;margin-top: 10px;margin-right: 10px">
            {{ item.initiatorTime!=null && item.initiatorTime!=undefined ? dayjs(item.initiatorTime).format('YYYY年 MM月 DD日 HH:mm') : '年  月  日' }}
          </div>
        </td>
        <td colspan="6" class="STYLE3" style="text-align: left; border:1px solid #000;">
          <div style="margin-top: 5px;margin-left: 5px">
            接收单位签字：
          </div>
          <div v-show="null != item.recipientSign && '' != item.recipientSign" style="margin-left: 15px">
            <img style="width: 50px;height: 50px;" :src="checkSignature(item.recipientSign)">
          </div>
      
          <div style="float: right;margin-top: 10px;margin-right: 10px">
          
            {{ item.receiveTime!=null && item.receiveTime!=undefined ? dayjs(item.receiveTime).format('YYYY年 MM月 DD日 HH:mm') : '年  月  日' }}
      
          </div>
        </td>
      </tr>
      <tr style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
        <td colspan="10" class="STYLE3" style="text-align: right; border:1px solid #000;">
          <div style="height: 60px;">
          </div>
          <div style="float: right;margin-right: 40px">
            签字：
          </div>
          <div style="height: 30px;">
          </div>
          <div style="float: right;margin-right: 10px">
            年    月    日
          </div>
        </td>
      </tr>
      <tr style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
        <td colspan="10" class="STYLE3" style="text-align: right; border:1px solid #000;">
          <div style="height: 60px;">
          </div>
          <div style="float: right;margin-right: 40px">
            签字：
          </div>
          <div style="height: 30px;">
          </div>
          <div style="float: right;margin-right: 10px">
            年    月    日
          </div>
        </td>
      </tr>
      </tbody>
    </table>
    <div v-if="item.entryMethod==1">
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

    <van-row justify="space-between" style="margin-top: 5px">
      <van-col :span="4">
      </van-col>
      <van-col :span="8">
        <div>
          <a-button style="width: 90px" v-if="buttonFlag" color="success" @click="sign">签收</a-button>
        </div>
      </van-col>
      <van-col :span="4">
      </van-col>
    </van-row>
  </div>
</template>
<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {defHttp} from "/@/utils/http/axios";
import {picPreviewUrl, uploadUrl,previewFile} from "/@/api/common/api";
import dayjs, {Dayjs} from "dayjs";
import {getToken} from "/@/utils/auth";
import { useRouter } from 'vue-router';
import { initDictOptions } from '/@/utils/dict';
import {UploadProps} from "ant-design-vue";

const headers = { 'X-Access-Token': getToken() };
const typeName = ref("");
const dateFormat = 'YYYY-MM-DD';
const uploadAction = uploadUrl;
const typeNameTip = ref("");
const type1 = ref(true);
const type2 = ref(false);
const type3 = ref(false);
const type4 = ref(false);
const type5 = ref(false);
const showEsign = ref(false);
const vueEsignRef = ref<any>(null);
const lineWidth = ref(6);
const lineColor = ref('#000000');
const bgColor = ref('');
const resultImg = ref('');
const isCrop = ref(false);
const router = useRouter();
const { currentRoute } = router;

const buttonFlag = ref(true);
let dictOptionsType = [];

let item = reactive({});

//预览
const offlineFileList = ref<UploadProps['fileList']>([]);
let fileList = ref<UploadProps['fileList']>([]);

const handleFilePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
};

initNoticeType();

/**
 * 初始化字典选项
 */
 async function initNoticeType() {
  dictOptionsType = await initDictOptions('notice_info_type');

}


if(currentRoute.value.query.id){

  let params = {};
  params.id = currentRoute.value.query.id;
  let isShowButton = currentRoute.value.query.isShowButton;

  if(isShowButton == 0){
    buttonFlag.value = false;
  }

  defHttp.get({ url: '/notice/ehsNoticeInfo/getById', params }).then((res) => {
    // item = res;
    Object.assign(item, res);
    for(let i=0;i<dictOptionsType.length;i++){
      if(item.type == dictOptionsType[i].value){
        typeName.value = dictOptionsType[i].text;
      }
    }

    if(item.type=='1'){
      type1.value = true;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    }else if(item.type=='2'){
      type1.value = false;
      type2.value = true;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="";
    }else if(item.type=='3'){
      type1.value = false;
      type2.value = false;
      type3.value = true;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="";
    }else if(item.type=='4'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = true;
      type5.value = false;
      typeNameTip.value="考核问题：";
    }else if(item.type=='5'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = true;
      typeNameTip.value="";
    }

    let imgList = [];
    item.enpInfo.map((v) => {
      let imgArr = [];
      if(v.img!=""&&v.img!=null){
        imgArr = v.img.split(",");
        imgArr.map((v) => {
          imgList.push(v)
        });
      }
    });
    if(imgList.length>0){
      item.enpInfo.imgList = imgList;
    }

    for(let i=0;i<item.enpInfo.length;i++){
      if( null != item.enpInfo[i].img && '' !=  item.enpInfo[i].img){
        const imgArr = item.enpInfo[i].img.split(",");
        let imgList = [];
        for(let j=0;j<imgArr.length;j++){
            if(imgArr[j].indexOf("http")==0){
              imgList.push(imgArr[j]);
            }else{
              imgList.push(picPreviewUrl+imgArr[j]);
            }
          }
        item.enpInfo[i].imgList = imgList;
      }
    }

    // 区分签收人图片格式

      const imgSign = item.recipientSign;
      if(null != imgSign && '' != imgSign && undefined != imgSign){

        if(imgSign.indexOf("http") ==0){
          item.signFlag = '1';
        }else if(imgSign.indexOf('noticeSign/') == 0){
          item.signFlag = '2';
        }else if(imgSign.indexOf('data:image/png;base64,') == 0){
          item.signFlag = '3';
        }
      }else{
        item.signFlag = '';
      }

       //通知书录入：附件线下发
    if(item.attachment != ""&&item.attachment != null){
        const attachment = item.attachment;
        const attachmentArry = attachment.split(",");

       let attachmentList = attachmentArry.map(e=>{
          return {
            uid: Math.random(),
            name: e.replaceAll("noticeFile/",""),
            status: 'done',
            path: e,
            url: picPreviewUrl + e
          }
        })

        if(item.entryMethod =='1'){
          fileList.value = attachmentList;
        }else{
          offlineFileList.value = attachmentList; 
        }
      }

       // 按钮是否显示
      if(item.status == '3'){
        buttonFlag.value = false;
      }

  });

}else {

   let res = JSON.parse(currentRoute.value.query.qm);
   Object.assign(item, res);
   dictOptionsType = JSON.parse(currentRoute.value.query.dictOptionsType);
   for(let i=0;i<dictOptionsType._value.length;i++){
      if(item.type==dictOptionsType._value[i].value){
        typeName.value = dictOptionsType._value[i].text;
      }
    }

    if(item.type=='1'){
      type1.value = true;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="经检查发现你单位存在以下问题，请及时整改：";
    }else if(item.type=='2'){
      type1.value = false;
      type2.value = true;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="";
    }else if(item.type=='3'){
      type1.value = false;
      type2.value = false;
      type3.value = true;
      type4.value = false;
      type5.value = false;
      typeNameTip.value="";
    }else if(item.type=='4'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = true;
      type5.value = false;
      typeNameTip.value="考核问题：";
    }else if(item.type=='5'){
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = true;
      typeNameTip.value="";
    }

    for(let i=0;i<item.enpInfo.length;i++){
      if( null != item.enpInfo[i].img && '' !=  item.enpInfo[i].img){

        const imgArr = item.enpInfo[i].img.split(",");
        let imgList = [];
        for(let j=0;j<imgArr.length;j++){
              if(imgArr[j].indexOf("http")==0){
                imgList.push(imgArr[j]);
              }else{
                imgList.push(picPreviewUrl+imgArr[j]);
              }
            }
        item.enpInfo[i].imgList = imgList;
      }
  }

   // 区分签收人图片格式
      const imgSign = item.recipientSign;
      if(null != imgSign && '' != imgSign && undefined != imgSign){
        if(imgSign.indexOf("http") == 0 ){
        item.signFlag = '1';
        }else if(imgSign.indexOf('noticeSignatureImg/') == 0){
          item.signFlag = '2';
        }else if(imgSign.indexOf('data:image/png;base64,') == 0){
          item.signFlag = '3';
        }
      }else{
        item.signFlag = '';
      }

    // 按钮是否显示
    if(item.status == '3'){
      buttonFlag.value = false;
    }

     //通知书录入：附件线下发
     if(item.attachment != ""&&item.attachment != null){
      const attachment = item.attachment;
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

  
}



const handleReset = async () => {
  vueEsignRef.value.reset()
};

const handleGenerate = async () => {

  vueEsignRef.value.generate().then(res => {
    resultImg.value = res;
  }).catch(err => {
    alert(err) // 画布没有签字时会执行这里 'Not Signned'
  })
};


const sign = () => {
  router.push({
    path: '/app/noticeInfoSign',
    query: {
      qm:JSON.stringify(item),
    }
  })
};

function partiallyHidden(text) {
  var leg = text.length;
  if (leg > 6) {
    return text.substring(0, 6) + '...';
  } else {
    return text;
  }
}

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


</script>

<style lang="less" scoped>

.app-em-wrap {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background: #FFFFFF;
}

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
  line-height: 20px;
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
</style>
