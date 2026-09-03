<template>
  <div class="app-em-wrap" align="center">
    <van-form ref="formEl" style="text-align: left;">
      <!--   项目名称   -->
      <a-row style="margin-top: 20px">
        <a-col :span="6" align="right">项目名称：</a-col>
        <a-col :span="17">{{item.eiaProjectName}}</a-col>
        <!--{{item.eiaProjectName}}-->
      </a-row>
      <!--   补充类型   -->
      <a-row style="margin-top: 20px">
        <a-col :span="6" align="right">补充类型：</a-col>
        <a-col :span="17">{{filterMultiDictText(dictAddType, item.type)}}</a-col>
      </a-row>
      <!--   补充要求   -->
      <a-row style="margin-top: 20px">
        <a-col :span="6" align="right">补充要求：</a-col>
        <a-col :span="17">{{item.addRequest}}</a-col>
      </a-row>
      <!--   截止日期   -->
      <a-row style="margin-top: 20px">
        <a-col :span="6" align="right">截止日期：</a-col>
        <a-col :span="17">{{item.endDt}}</a-col>
      </a-row>
      <!--   补充说明   -->
      <a-row style="margin-top: 20px">
        <a-col :span="6" align="right">补充说明：</a-col>
        <a-col :span="17">{{item.addExplain}}</a-col>
      </a-row>
      <a-row style="margin-top: 20px;">
        <a-col :span="6" align="right">补充资料：</a-col>
        <a-col :span="17">
          <customize-upload is-type="app" v-model:value="item.attach" type="view" />
        </a-col>
      </a-row>
      <div style="background-color: #F59A23" v-show="item.status=='1'" type="primary" native-type="submit" class="buttonClass1" align="center" @click="handleAuditOk">
        <span>
          审核通过
        </span>
      </div>
      <div class="buttonClass1" v-show="item.status=='1'" type="primary" native-type="submit" align="center" @click="handleAuditNOk">
        <span>
          审核退回
        </span>
      </div>
    </van-form>
  </div>
  <van-popup round v-model:show="show" style="max-height: 540px; min-height: 220px; min-width: 300px">
    <div style="text-align: center;font-size: 16px;font-weight: bold;margin-top: 12px;">{{popTitle}}</div>
    <van-form ref="formEl">
      <a-row justify="center" style="margin-top: 12px">
        <a-col :span="20">
          <van-field
            style="width: 100%;"
            v-model="auditStatement"
            type="textarea"
            :rows="4"
            maxlength="50"
            show-word-limit
            clearable
            placeholder="请输入审核说明" />
        </a-col>
      </a-row>
      <div class="buttonClass2" style="background-color: #F59A23;" type="primary" native-type="submit" align="center" @click="handlePopOk">
        <span>
          提交
        </span>
      </div>
      <div class="buttonClass2" style="color: black;" native-type="submit" align="center" @click="handlePopCancle">
        <span>
          取消
        </span>
      </div>
    </van-form>
  </van-popup>
</template>
<script lang="ts" setup>
  import {ref, computed, unref, reactive } from 'vue';
  import {SelectProps, UploadChangeParam, UploadProps} from "ant-design-vue";
  import {defHttp} from "/@/utils/http/axios";
  import {picPreviewUrl, uploadUrl} from "/@/api/common/api";
  import {getToken} from "/@/utils/auth";
  import {useRouter} from 'vue-router';
  import {useUserStore} from '/@/store/modules/user';
  import dayjs from "dayjs";
  import {FormInstance} from "vant";
  import {initDictOptions} from "/@/utils/dict";
  import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
  import CustomizeUpload from '/@/views/incidentManage/incidentExpress/component/CustomizeUpload.vue';
  import uni from "@dcloudio/uni-webview-js"

  const userStore = useUserStore();
  const userinfo = computed(() => userStore.getUserInfo);
  const loginInfo = computed(() => userStore.getLoginInfo);
  const headers = {'X-Access-Token': getToken()};
  const signature = ref(userinfo.value.signature);
  const auditorInfo = ref<SelectProps['options']>([]);
  const router = useRouter();
  const {currentRoute} = router;
  const item = reactive({});
  const show = ref(false);
  const showButt = ref(false);
  const popTitle = ref("审核不通过");
  const dictAddType = ref<any>([]);
  // const item = JSON.parse(currentRoute.value.query.qm);

  //表单数据
  const formEl = ref<FormInstance>();
  const fileList = ref('');
  const auditStatement = ref('');
  const status = ref('');

  loadDate();
  async function loadDate(){
    dictAddType.value = await initDictOptions('eia_add_type');
    if (currentRoute.value.query.id) {
      let params = {};
      params.id = currentRoute.value.query.id;
      await defHttp.get({url: '/eia/ehsEiaAddAudit/appGetById', params}).then((res) => {
        Object.assign(item, res);
        showButt.value = item.status == '1';
      });
    }
  }

  //审核退回
  async function handleAuditNOk() {
    status.value = '3';
    show.value = true;
  }

  //审核通过
  async function handleAuditOk() {
    status.value = '2';
    let url = '/eia/ehsEiaAddAudit/audit';
    let infoFormData = {
      'id': item.addAuditId,
      'status': status.value,
      'auditStatement': auditStatement.value,
    };
    await defHttp.post({url: url,params: infoFormData}).then(res=>{
      show.value = false;
      uni.webView.postMessage({data:{action: 'toBack'}});
      // loadDate()
    });
  }

  //确定
  async function handlePopOk() {
    let url = '/eia/ehsEiaAddAudit/audit';
    let infoFormData = {
      'id': item.addAuditId,
      'status': status.value,
      'auditStatement': auditStatement.value,
    };
    await defHttp.post({url: url,params: infoFormData}).then(res=>{
      show.value = false;
      uni.webView.postMessage({data:{action: 'toBack'}});
      // loadDate()
      }
    );
  }

  //取消
  async function handlePopCancle() {
    show.value = false;
    auditStatement.value = '';
  }

</script>

<style lang="less" scoped>

  .app-em-wrap {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    background: #FFFFFF;
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
    float: right;
    width: 60px;
    height: 30px;
    line-height: 25px;
    color: white;
    margin: 20px 50px;
    border: 1px solid #f6f7f8;
  }

  .van-field{
    border-radius: 6px;
    border: 1px solid #ccc;
  }
</style>
