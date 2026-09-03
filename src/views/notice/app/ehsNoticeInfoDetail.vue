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
        <td colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
          {{item.receiveOrgName}}:
        </td>
      </tr>
      <tr>
        <td v-if="type1||type4" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
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
              <div v-for="(imgItem, index2) in info.imgList" :key="imgItem.id">
                <img style="width: 50px;height: 50px" :src="imgItem">
              </div>
            </van-row>
          </div>
        </td>
        <td v-if="(type2||type3||type5)&&item.entryMethod==1" colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
          <div class="STYLE3" style="margin-left: 50px">
            {{typeNameTip}}
          </div>
          <div style="margin-bottom: 8px;margin-left: 10px" align="baseline">
            {{item.noticeContent}}
          </div>
        </td>
      </tr>
      <tr v-if="item.entryMethod==1" style="height:100%; border: 1px solid #000;">
        <td colspan="3" class="STYLE3" style="text-align: center;border:1px solid #000;">整改要求</td>
        <td colspan="11" class="STYLE3" style="font-weight:normal;text-align: left; word-break: break-all;">{{ item.content }}</td>
      </tr>
      <tr v-if="item.entryMethod==2" style="height:50px; border: 1px solid #000;" >
        <td colspan="14" class="STYLE3" style="font-weight:normal;text-align: left;">
          附件：
          <a-upload
            v-model:file-list="fileList"
            name="file"
            :headers="headers"
            :data="{'biz':'noticeFile'}"
            :max-count="5"
            @preview="handlePreview"
            :show-upload-list="{ showDownloadIcon: false, showRemoveIcon: false }"
          >
          </a-upload>
        </td>
      </tr>
      <tr v-if="type1||type2||type3" style="height:100%; border: 1px solid #000;">
        <td colspan="3" class="STYLE3" style="text-align: center; border:1px solid #000;">整改期限</td>
        <td colspan="11" class="STYLE3" style="font-weight:normal;text-align: left;">{{ item.endDt }}</td>
      </tr>
      <tr style="height:100%; border: 1px solid #000;">
        <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
          <div style="margin-top: 5px;margin-left: 5px ">
            签发人签字：
          </div>
          <!-- <div style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.signature">
          </div> -->
          <div v-if="item.signatureFlag == '1'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.signature">
          </div>
          <div v-if="item.signatureFlag == '2'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.signature">
          </div>
          <div v-if="item.signatureFlag == '3'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.signature">
          </div>

          <div style="float: right;margin-top: 70px;margin-right: 10px">
            {{ item.initiatorTime!=""?dayjs(item.initiatorTime).format('YYYY年MM月DD日'):"年  月  日" }}
          </div>
        </td>
        <td colspan="7" class="STYLE3" style="text-align: left; border:1px solid #000;">
          <div style="margin-top: 5px;margin-left: 5px ">
            接收单位签字：
          </div>
          <div v-if="item.recipientSignFlag == '1'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.recipientSign">
          </div>
          <div v-if="item.recipientSignFlag == '2'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="picPreviewUrl+item.recipientSign">
          </div>
          <div v-if="item.recipientSignFlag == '3'" style="margin-left: 15px">
            <img style="width: 100px;height: 40px;" :src="item.recipientSign">
          </div>
          <div style="float: right;margin-top: 70px;margin-right: 10px">
            年    月    日
          </div>
        </td>
      </tr>
      <tr style="height:100%; border: 1px solid #000;">
        <td colspan="3" class="STYLE3" style="text-align: center;border:1px solid #000;">整改反馈</td>
        <td colspan="11" class="STYLE3" style="text-align: right; border:1px solid #000;">
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
        <td colspan="3" class="STYLE3" style="text-align: center; border:1px solid #000;">复查结果</td>
        <td colspan="11" class="STYLE3" style="text-align: right; border:1px solid #000;">
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
    <div v-if="item.entryMethod==1" class="ant-col ant-col-24">
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
    <van-row v-show="isShowButton==1" justify="space-between" style="margin-top: 5px">
      <van-col :span="4">
      </van-col>
      <van-col :span="8">
        <div>
          <a-button style="width: 90px" color="success" @click="reviewingNo">不同意</a-button>
        </div>
      </van-col>
      <van-col :span="8">
        <div>
          <a-button style="width: 90px" type="primary" @click="reviewing">同意下发</a-button>
        </div>
      </van-col>
      <van-col :span="4">
      </van-col>
    </van-row>
    <van-dialog width="300px" v-model:show="visibleNo" title="审核不同意" @confirm="handleNo" @cancel="handleCancel"
                show-cancel-button :before-close="beforeClose">
      <van-cell-group inset>
        <van-field
          v-model="reviewingContent"
          rows="2"
          autosize
          type="textarea"
          maxlength="50"
          placeholder="请输入审核说明"
          show-word-limit
        />
      </van-cell-group>

    </van-dialog>
  </div>
</template>
<script lang="ts" setup>
  import {ref, computed, reactive} from 'vue';
import {picPreviewUrl, previewFile, uploadUrl} from "/@/api/common/api";
import {getToken} from "/@/utils/auth";
import { useRouter } from 'vue-router';
import {useUserStore} from '/@/store/modules/user';
import {approve} from "/@/views/notice/noticeDeliver/EhsNoticeInfo.api";
import { initDictOptions } from '/@/utils/dict';
import {defHttp} from "/@/utils/http/axios";
import { showSuccessToast, showFailToast } from 'vant';
import {UploadProps} from "ant-design-vue";
import dayjs, {Dayjs} from "dayjs";

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
let item = reactive({});
let dictOptionsType = [];
let fileList = ref<UploadProps['fileList']>([]);

const isShowButton = ref("1");


initDictConfig();
/**
 * 初始化字典选项
 */
async function initDictConfig() {
  dictOptionsType = await initDictOptions('notice_info_type');
}

if(currentRoute.value.query.id){
  isShowButton.value = currentRoute.value.query.isShowButton;
  let params = {};
  params.id = currentRoute.value.query.id;
  defHttp.get({ url: '/notice/ehsNoticeInfo/getById', params }).then((res) => {
    Object.assign(item,res);
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
    for(let i=0;i<item.enpInfo.length;i++){
      if(item.enpInfo[i].img!=''){
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
    if(item.attachment != ""&&item.attachment != null){
      const attachment = item.attachment;
      const attachmentArry = attachment.split(",");
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
  });
}


//设置标题
const title = computed(() => ('发通知'));

//审核通过
const reviewing = () => {
  router.push({
    path: '/app/noticeReviewing',
    query: {
      qm:JSON.stringify(item),
      dictOptionsType:JSON.stringify(dictOptionsType),
    }
  })
};


//审核不通过
const visibleNo = ref<boolean>(false);
const reviewingNo = () => {
  visibleNo.value = true;
};

const beforeClose = (action) => {
  if(action === 'confirm'){
    if(reviewingContent.value.length<=0){
      showFailToast('请输入审核说明！');
      return false;
    }else{
      return true
    }
  }
};


async function handleNo() {
  if(reviewingContent.value.length<=0){
  }else{
    let values = {
      id: item.id,
      status: '11',
      reviewingContent: reviewingContent.value,
    };
    //提交表单
    let res = await approve(values);
    // router.push({
    //   path: '/app/notice',
    // })
    // router.push({
    //   path: '/app/noticeDetail',
    //   query: {
    //     id:item.id,
    //     isShowButton:'0',
    //     dictOptionsType:JSON.stringify(dictOptionsType),
    //   }
    // })
    isShowButton.value = 0;
    visibleNo.value = false;
  }
}

async function handleCancel() {
  visibleNo.value = false;
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
  font-size: 16px;
}

.STYLE3 {
  font-family: "宋体";
  font-size: 13px;
  font-weight: bold;
}

.STYLE4 {
  font-family: "宋体";
  font-size: 12px;
  font-weight: bold;
  line-height: 20px;
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
