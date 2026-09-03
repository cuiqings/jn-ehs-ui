<template>
  <div class="app-em-wrap" align="center">
    <van-row justify="space-between" style="margin-top: 20px">
      <div class="" style="margin-left: 10px">
        <span style="color: red">*</span><span>本人签字：</span>
      </div>
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px">
      <div class="" style="margin-left: 10px">
        <img v-if="isShowSignature" style="width: 200px;height: 100px;" :src="signature">
      </div>
      <div class="" style="margin-left: 10px">
        <div class="buttonClass1" @click="reviewing">
          <span>
            重新签字
          </span>
        </div>
      </div>
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px">
      <div class="" style="margin-left: 10px">
        <span style="color: red">*</span><span> 整改责任人</span>
      </div>
    </van-row>
    <van-row justify="space-between" style="margin-top: 20px">
      <div style="width: 100%">
        <a-select
          v-model:value="correctorId"
          placeholder="请选择"
          style="width: 90%"
          :options="auditorInfo"
          labelInValue
          @change="auditorIdSelectChange"
          show-search
          :filter-option="filterOption"
        ></a-select>
      </div>
    </van-row>
    <div class="buttonClass2" align="center" @click="handleOk">
      <span>
        提交
      </span>
    </div>
    <van-dialog width="300px" v-model:show="showEsign" title="签名" @confirm="handleGenerate"
                show-cancel-button>
      <vue-esign ref="vueEsignRef" :width="800" :height="500" :isCrop="isCrop"
                 :lineWidth="lineWidth" :lineColor="lineColor" v-model:bgColor="bgColor"/>

      <div class="buttonClass3" align="center" @click="handleReset">
        <span>
          清空
        </span>
      </div>
    </van-dialog>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed, unref, reactive} from 'vue';
import {SelectProps, UploadChangeParam, UploadProps} from "ant-design-vue";
import {confirmSign} from '../noticeSign/EhsNoticeInfo.api';
import {defHttp} from "/@/utils/http/axios";
import {picPreviewUrl, uploadUrl} from "/@/api/common/api";
import {getToken} from "/@/utils/auth";
import {useRouter} from 'vue-router';
import {useUserStore} from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';

const { createMessage } = useMessage();
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

const correctorId = ref(userinfo.value.id);
const isShowSignature = ref(false);

const filterOption = (input: string, option: any) => {
  return option.label.indexOf(input) >= 0;
};


function auditorIdSelectChange(v) { //{key,label}
correctorId.value = v.key;
  // console.log(v)
}


async function getAuditorUser() {

let orgCode = userinfo.value.orgCode;
  let params = {
    orgCode: orgCode
  };
  let res = await defHttp.get({
    url: '/jn/common/getUserInfoByOrgCodeForV2AndV3',
    params
  }, {isTransformResponse: false});
  if (res.success && res.result){
    auditorInfo.value = [...res.result];
  } else {
    console.log('数根节点查询结果异常', res);
  }
}

getAuditorUser();

//设置标题
// const title = computed(() => ('发通知'));

//审核通过
// const visibleOk = ref<boolean>(false);

const reviewing = () => {
  showEsign.value = true;
}

const handleReset = async () => {
  vueEsignRef.value.reset()
}

const handleGenerate = async () => {
  console.log('vueEsignRef', vueEsignRef.value)
  vueEsignRef.value.generate().then(res => {
    resultImg.value = res;
    // console.log('resultImg', resultImg.value)
    signature.value = resultImg.value;
    isShowSignature.value = true;
  }).catch(err => {
    alert(err) // 画布没有签字时会执行这里 'Not Signned'
  })
}

if(userinfo.value.signature!=null&&userinfo.value.signature!=""&&userinfo.value.signature!=undefined){
  signature.value = userinfo.value.signature;
  isShowSignature.value = true;
}else{
  isShowSignature.value = false;
}


//审核通过签字
async function handleOk(v) {

  // 验证必填项

  if(null == signature.value || '' == signature.value){
    createMessage.info('请上传本人签字!');
    return;
  }
  
  if(null == correctorId.value || '' == correctorId.value){
    createMessage.info('请选择整改责任人!');
    return;
  }

  let signDepartmentName = '';
  if(loginInfo.value.departs.length>0){
          signDepartmentName = loginInfo.value.departs[0].departName;
    }
  let values = {
    id: item.id,
    status: '3',
    recipientSign: signature.value,
    signName:loginInfo.value.userInfo.realname,
    signDepartmentName: signDepartmentName,
    correctorId : correctorId.value
  };
  //提交表单
  await confirmSign(values,true);
  router.push({
    path: '/app/noticeInfoSignDetail',
    query: {
      id:item.id,
      isShowButton:'0',
    }
  })
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
</style>
