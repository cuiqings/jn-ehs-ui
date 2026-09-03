<template>
  <div class="app-em-wrap" align="center">
    <van-form ref="formEl">
    <van-row justify="space-between" style="margin-top: 20px">
      <div class="" style="margin-left: 10px">
        <span style="color: red">*</span><span>整改反馈：</span>
      </div>
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px">
      <van-cell inset>
        <van-field
          name="correctionFeedback"
          v-model="correctionFeedback"
          :rules="[{ required: true, message: '请填写整改反馈！' }]"
          type="textarea"
          :rows="4"
          autosize
          maxlength="300"
          show-word-limit
          clearable
          placeholder="请输入" />
      </van-cell>
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px;margin-left: 10px">
      <appUpload
        v-model:fileList="imgList"
        :multiple="true"
      />
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px;margin-left: 10px">
      <appUploadFile
        v-model:fileList="fileList"
        :maxCount=1
      />
    </van-row>
    <div class="buttonClass2" align="center" @click="handleOk">
      <span>
        提交
      </span>
    </div>
    </van-form>
  </div>
</template>
<script lang="ts" setup>
import {ref, computed, unref, reactive } from 'vue';
import {SelectProps, UploadChangeParam, UploadProps} from "ant-design-vue";
import {approve} from '../noticeDeliver/EhsNoticeInfo.api';
import {defHttp} from "/@/utils/http/axios";
import {picPreviewUrl, uploadUrl} from "/@/api/common/api";
import {getToken} from "/@/utils/auth";
import {useRouter} from 'vue-router';
import {useUserStore} from '/@/store/modules/user';
import appUpload from '../components/app/AppUpload.vue'
import appUploadFile from '/@/components/App/AppUploadFile.vue'
import dayjs from "dayjs";
import {FormInstance} from "vant";
import {ValidateErrorEntity} from "ant-design-vue/lib/form/interface";

const userStore = useUserStore();
const userinfo = computed(() => userStore.getUserInfo);
const loginInfo = computed(() => userStore.getLoginInfo);
const headers = {'X-Access-Token': getToken()}
const uploadAction = uploadUrl;
const showEsign = ref(false);
const signature = ref(userinfo.value.signature);
const vueEsignRef = ref<any>(null);
const lineWidth = ref(6);
const lineColor = ref('#000000');
const bgColor = ref('');
const resultImg = ref('')
const isCrop = ref(false);
const auditorInfo = ref<SelectProps['options']>([]);
const router = useRouter();
const {currentRoute} = router;
const item = JSON.parse(currentRoute.value.query.qm);
const dictOptionsType = JSON.parse(currentRoute.value.query.dictOptionsType);

//表单数据
const formEl = ref<FormInstance>();
const imgList = ref('');
const fileList = ref('');
const correctionFeedback = ref('');

const auditorId = ref('');
const auditorIdP = ref('');
const auditorNameP = ref('');
function auditorIdSelectChange(v) { //{key,label}
  auditorIdP.value = v.key;
  auditorNameP.value = v.label;
  console.log(v)
}

async function getAuditorUser(departIds) {
  let params = {
    departIds: departIds
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfo',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result) {
    auditorInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

//整改反馈
async function handleOk() {
  formEl.value?.validate().then(async() => {
    console.log("=====app-整改反馈=====", imgList);
    let values = {
      noticeInfoId: item.id,
      correctionFeedback: correctionFeedback.value,
      img: imgList.value,
      attachment: fileList.value,
      status: '0',
    };
    let url = '/notice/ehsNoticeCorrection/add';
    await defHttp.post({url: url, params: values});
    let infourl = '/notice/ehsNoticeInfo/correctionEdit';
    let infoFormData = {
      'id': item.id,
      'status': '4',
      'correctorTime': dayjs(),
      'correctorSign': userinfo.value.signature
    };
    await defHttp.post({url: infourl, params: infoFormData}, {successMessageMode: 'none'});
    router.push({
      path: `/app/ehsNoticeInfoRecDetail`,
      query: {id: item.id},
    })
  }).catch((error: ValidateErrorEntity<any>) => {
    console.log('error', error);
  });
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

.buttonClass1 {
  border-radius: 5px;
  text-align: center;
  float: right;
  margin-right: 80px;
  width: 80px;
  height: 30px;
  line-height: 30px;
  background-color: #0a9fe5;
  color: white;
  margin-top: 40px;
}
.buttonClass2 {
  border-radius: 5px;
  text-align: center;
  width: 80px;
  height: 30px;
  line-height: 30px;
  background-color: #0a9fe5;
  color: white;
  margin-top: 200px;
}
.buttonClass3 {
  border-radius: 5px;
  text-align: center;
  width: 80px;
  height: 30px;
  line-height: 30px;
  background-color: #0a9fe5;
  color: white;
  margin-top: 10px;
}

.van-field{
  border-radius: 6px;
  border: 1px solid #ccc;
}
</style>
