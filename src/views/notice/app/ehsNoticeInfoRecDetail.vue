<template>
  <div class="app-em-wrap" align="center">
    <a-row  justify="space-between" style="margin-top: 10px">
      <a-col :span="4">
        <div style="margin-left: 2px;">
          <img src="/resource/img/logo.png" style="width: 50px;" alt="">
        </div>
      </a-col>
      <a-col :span="20">
        <div style="margin: 0px 10px 0px 0px;">
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
      <tr v-if="item.entryMethod==1">
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
              <span style="text-align: justify;">{{index1+1}}.{{info.problemContent}}</span>
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
          <div style="margin-bottom: 8px;margin-left: 10px;text-align: justify;" align="baseline">
            {{item.noticeContent}}
          </div>
        </td>
      </tr>
      <tr v-if="item.entryMethod==2" height="28" style="height:30.00pt;  border: 1px solid #000;">
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
        <td colspan="10" class="STYLE3" style="font-weight:normal;text-align: justify; word-break: break-all;">{{ item.content }}</td>
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
<!--          <div style="margin-left: 15px">-->
<!--            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.signature">-->
<!--          </div>-->
          <div v-if="item.signatureFlag == '1'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.signature">
          </div>
          <div v-if="item.signatureFlag == '2'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.signature">
          </div>
          <div v-if="item.signatureFlag == '3'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.signature">
          </div>
          <div style="font-weight: normal;float: right;margin-top: 10px;margin-right: 2px">
            {{ item.initiatorTime!=null && item.initiatorTime!=undefined ? dayjs(item.initiatorTime).format('YYYY年 MM月 DD日 HH:mm') : '' }}
          </div>
        </td>
        <td colspan="6" class="STYLE3" style="text-align: left; border:1px solid #000;">
          <div style="margin-top: 5px;margin-left: 5px">
            接收单位签字：
          </div>
<!--          <div style="margin-left: 15px">-->
<!--            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.recipientSign">-->
<!--          </div>-->
          <div v-if="item.recipientSignFlag == '1'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.recipientSign">
          </div>
          <div v-if="item.recipientSignFlag == '2'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.recipientSign">
          </div>
          <div v-if="item.recipientSignFlag == '3'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.recipientSign">
          </div>
          <div style="font-weight: normal;float: right;margin-top: 10px;margin-right: 2px">
            {{ item.receiveTime!=null && item.receiveTime!=undefined ? dayjs(item.receiveTime).format('YYYY年 MM月 DD日 HH:mm') : '' }}
          </div>
        </td>
      </tr>
      <tr v-show="type1||type2||type3" style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
        <td colspan="10" class="STYLE3" style="font-weight:normal;text-align: left; border:1px solid #000;">
          <div v-for="(correction,index) in correctionList" :key="correction.id">
            <div>
              第{{index+1}}次整改反馈：
            </div>
            <div style="text-align:justify;">
              &nbsp;
              {{ correction.correctionFeedback }}
            </div>
            <div>
              <div style="display: inline-block;" v-for="(imgItem, index2) in correction.img" :key="index2">
                <img style="width: 50px;height: 50px" :src="picPreviewUrl+imgItem">
              </div>
            </div>
            <a-upload
              v-model:file-list="correction.attachment"
              name="file"
              :max-count="1"
              @preview="handleFilePreview"
              :show-upload-list="{ showDownloadIcon: true, showRemoveIcon: false }"
              disabled
            >
            </a-upload>
            <div style="float: right;" v-show="index+1 == correctionList.length">
              <div style="margin-right: 40px">
                签字：
              </div>
              <div style="margin-right: 20px;">
                <img style="height: 40px" :src="item.correctorSign">
              </div>
              <div style="font-weight: normal;margin-right: 10px">
                {{ item.correctorTime!=null && item.correctorTime!=undefined ? dayjs(item.correctorTime).format('YYYY年 MM月 DD日 HH:mm') : '' }}
              </div>
            </div>
          </div>
        </td>
      </tr>
      <tr v-show="type1||type2||type3" style="height:100%; border: 1px solid #000;">
        <td colspan="2" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
        <td colspan="10" class="STYLE3" style="font-weight:normal;text-align: left;border:1px solid #000;">
          <div v-for="(correction,index) in correctionList" :key="correction.id">
            <div v-if="correction.status != '0'">
            <div>
              第{{index+1}}次复查结果：
            </div>
            <div style="text-align:justify;">
              &nbsp;
              {{ correction.reviewOpinion }}
            </div>
            <div>
              <div style="display: inline-block;" v-for="(imgItem, index2) in correction.reviewImg" :key="index2">
                <img style="width: 50px;height: 50px" :src="picPreviewUrl+imgItem">
              </div>
            </div>
            <div style="float: right;" v-show="index+1 == correctionList.length">
              <div style="margin-right: 40px">
                签字：
              </div>
              <div style="margin-right: 20px;">
                <img style="height: 40px" :src="item.reviewSign">
              </div>
              <div style="font-weight: normal;margin-right: 10px">
                {{ item.reviewTime!=null && item.reviewTime!=undefined ? dayjs(item.reviewTime).format('YYYY年 MM月 DD日 HH:mm') : '' }}
              </div>
            </div>
            </div>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
    <van-row v-if="item.entryMethod==1">
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
    </van-row>
    <van-row justify="space-between" style="margin-top: 5px">
      <van-col :span="4">
      </van-col>
      <van-col :span="8">
        <div v-show="item.status =='3' && userinfo.id == item.correctorId && isShowButton == '1'">
          <a-button style="width: 90px" type="primary" @click="noticeFeedback">整改反馈</a-button>
        </div>
        <van-col :span="8">
        <div v-show="item.status =='4' && userinfo.id == item.signUserid && isShowButton == '1'">
          <a-button style="width: 90px" type="primary" @click="noticeFedReview">复查</a-button>
        </div>
        </van-col>
      </van-col>
      <van-col :span="4">
      </van-col>
    </van-row>
  </div>
</template>
<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {picPreviewUrl, previewFile, uploadUrl} from "/@/api/common/api";
import {getToken} from "/@/utils/auth";
import { useRouter } from 'vue-router';
import {useUserStore} from '/@/store/modules/user';
import {approve} from "/@/views/notice/noticeDeliver/EhsNoticeInfo.api";
import {defHttp} from "/@/utils/http/axios";
import dayjs, { Dayjs } from 'dayjs';
import {initDictOptions} from "/@/utils/dict";
import {UploadProps} from "ant-design-vue";

const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
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
const signature = ref(userinfo.value.signature);
const reviewingContent = ref("");
const router = useRouter();
const { currentRoute } = router;
const item = reactive({});
let dictOptionsType = [];
const isShowButton = ref("0");

//预览
const offlineFileList = ref<UploadProps['fileList']>([]);
const correctionList = ref([]);
const isCorrection = ref(false);

loadDate();
async function loadDate(){
  dictOptionsType = await initDictOptions('notice_info_type');
  isShowButton.value = currentRoute.value.query.isShowButton;
  if (currentRoute.value.query.id) {
    let params = {};
    params.id = currentRoute.value.query.id;
    await defHttp.get({url: '/notice/ehsNoticeInfo/getById', params}).then((res) => {
      Object.assign(item,res);
      for (let i = 0; i < dictOptionsType.length; i++) {
        if (item.type == dictOptionsType[i].value) {
          typeName.value = dictOptionsType[i].text;
        }
      }
      if (item.type == '1') {
        type1.value = true;
        type2.value = false;
        type3.value = false;
        type4.value = false;
        type5.value = false;
        typeNameTip.value = "经检查发现你单位存在以下问题，请及时整改：";
      } else if (item.type == '2') {
        type1.value = false;
        type2.value = true;
        type3.value = false;
        type4.value = false;
        type5.value = false;
        typeNameTip.value = "";
      } else if (item.type == '3') {
        type1.value = false;
        type2.value = false;
        type3.value = true;
        type4.value = false;
        type5.value = false;
        typeNameTip.value = "";
      } else if (item.type == '4') {
        type1.value = false;
        type2.value = false;
        type3.value = false;
        type4.value = true;
        type5.value = false;
        typeNameTip.value = "考核问题：";
      } else if (item.type == '5') {
        type1.value = false;
        type2.value = false;
        type3.value = false;
        type4.value = false;
        type5.value = true;
        typeNameTip.value = "";
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
      // let imgList = [];
      // item.enpInfo.map((v) => {
      //   let imgArr = [];
      //   if (v.img != "" && v.img != null) {
      //     imgArr = v.img.split(",");
      //     imgArr.map((v) => {
      //       imgList.push(v)
      //     });
      //   }
      // });
      // if (imgList.length > 0) {
      //   item.enpInfo.imgList = imgList;
      // }

      for (let i = 0; i < item.enpInfo.length; i++) {
        let imgList = [];
        if(item.enpInfo[i].img != ""&&item.enpInfo[i].img != null){
          const imgArr = item.enpInfo[i].img.split(",");
          for(let j=0;j<imgArr.length;j++){
            if(imgArr[j].indexOf("http")==0){
              imgList.push(imgArr[j]);
            }else{
              imgList.push(picPreviewUrl+imgArr[j]);
            }
          }
        }
        item.enpInfo[i].imgList = imgList;
      }

    });
    // 区分签发人图片格式
    const signature = item.signature;
    if(null != signature && '' != signature && undefined != signature){
      if(signature.indexOf("http") ==0){
        item.signatureFlag = '1';
      }else if(signature.indexOf('data:image/png;base64,') == 0){
        item.signatureFlag = '3';
      }else{
        item.signatureFlag = '2';
      }
    }else{
      item.signatureFlag = '';
    }
    // 区分签收人图片格式
    const recipientSign = item.recipientSign;
    if(null != recipientSign && '' != recipientSign && undefined != recipientSign){
      if(recipientSign.indexOf("http") ==0){
        item.recipientSignFlag = '1';
      }else if(recipientSign.indexOf('data:image/png;base64,') == 0){
        item.recipientSignFlag = '3';
      }else {
        item.recipientSignFlag = '2';
      }
    }else{
      item.recipientSignFlag = '';
    }
  } else {
    Object.assign(item,JSON.parse(currentRoute.value.query.qm));

    console.log(item);
    if (item.type == '1') {
      type1.value = true;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value = "经检查发现你单位存在以下问题，请及时整改：";
    } else if (item.type == '2') {
      type1.value = false;
      type2.value = true;
      type3.value = false;
      type4.value = false;
      type5.value = false;
      typeNameTip.value = "";
    } else if (item.type == '3') {
      type1.value = false;
      type2.value = false;
      type3.value = true;
      type4.value = false;
      type5.value = false;
      typeNameTip.value = "";
    } else if (item.type == '4') {
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = true;
      type5.value = false;
      typeNameTip.value = "考核问题：";
    } else if (item.type == '5') {
      type1.value = false;
      type2.value = false;
      type3.value = false;
      type4.value = false;
      type5.value = true;
      typeNameTip.value = "";
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

    for (let i = 0; i < item.enpInfo.length; i++) {
      let imgList = [];
      if(item.enpInfo[i].img != ""&&item.enpInfo[i].img != null) {
        const imgArr = item.enpInfo[i].img.split(",");
        for (let j = 0; j < imgArr.length; j++) {
          if (imgArr[j].indexOf("http") == 0) {
            imgList.push(imgArr[j]);
          } else {
            imgList.push(picPreviewUrl + imgArr[j]);
          }
        }
      }
      item.enpInfo[i].imgList = imgList;
    }

    // dictOptionsType = JSON.parse(currentRoute.value.query.dictOptionsType);
    for (let i = 0; i < dictOptionsType.length; i++) {
      if (item.type == dictOptionsType[i].value) {
        typeName.value = dictOptionsType[i].text;
      }
    }
  }

  // 区分签发人图片格式
  const signature = item.signature;
  if(null != signature && '' != signature && undefined != signature){
    if(signature.indexOf("http") ==0){
      item.signatureFlag = '1';
    }else if(signature.indexOf('data:image/png;base64,') == 0){
      item.signatureFlag = '3';
    }else{
      item.signatureFlag = '2';
    }
  }else{
    item.signatureFlag = '';
  }
  // 区分签收人图片格式
  const recipientSign = item.recipientSign;
  if(null != recipientSign && '' != recipientSign && undefined != recipientSign){
    if(recipientSign.indexOf("http") ==0){
      item.recipientSignFlag = '1';
    }else if(recipientSign.indexOf('data:image/png;base64,') == 0){
      item.recipientSignFlag = '3';
    }else{
      item.recipientSignFlag = '2';
    }
  }else{
    item.recipientSignFlag = '';
  }

  let url = '/notice/ehsNoticeCorrection/listByInfoId';
  await defHttp.get({url: url,params: {'noticeInfoId': item.id}}).then(res => {
    item.correctionList = res;
    if(res.length > 0){
      res.forEach(item=>{
        let correction = Object.assign({}, item);
        if(correction.img != "" && correction.img != null){
          correction.img = correction.img.split(",").map(e => e);
        } else {
          correction.img = [];
        }
        if(correction.reviewImg != "" && correction.reviewImg != null){
          correction.reviewImg = correction.reviewImg.split(",").map(e => e);
        } else {
          correction.reviewImg = [];
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
        correctionList.value.push(correction);
      });
      isCorrection.value = true;
    }else{
      isCorrection.value = false;
    }
  });
  console.log(item);
}

//设置标题
const title = computed(() => ('发通知'));

//整改反馈
const noticeFeedback = () => {
  router.push({
    path: '/app/ehsNoticeFeedback',
    query: {
      qm:JSON.stringify(item),
      dictOptionsType:JSON.stringify(dictOptionsType),
    }
  })
};
//复查
const noticeFedReview = () => {
  router.push({
    path: '/app/ehsNoticeFedReview',
    query: {
      qm:JSON.stringify(item),
      dictOptionsType:JSON.stringify(dictOptionsType),
    }
  })
};
const handleFilePreview = async (file: UploadProps['fileList'][number]) => {
  previewFile(file.path).then((res) => {
    window.open(res, '_blank');
  });
};
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
