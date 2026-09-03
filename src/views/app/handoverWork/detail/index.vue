<template>
  <div class="detail">
    <van-form ref="formRef" input-align="right">
      <van-field
        input-align="left"
        v-model="formData.orgCodeName"
        label="单位"
        :readonly="true"
        :disabled="disabled"
      />
      <van-field
        input-align="left"
        v-model="formData.workshopName"
        label="车间"
        :readonly="true"
        :disabled="disabled"
      />
      <van-field
        input-align="left"
        v-model="formData.workTime"
        label="上班时间"
        :readonly="true"
        :disabled="disabled"
      />
      <van-field
        input-align="left"
        v-model="formData.teamName"
        label="班次"
        :readonly="true"
        :disabled="disabled"
      />
      <div class="title">交班内容</div>
      <van-field
        input-align="left"
        v-model="formData.successionTeamName"
        label="接班班组"
        :readonly="true"
        :disabled="disabled"
        required
         @click="openPicker"
        :rules="[{ required: true, message: '请选择班组！' }]"
      />
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.handoverContent.production"
        required
        name="production"
        label="生产（维修）情况（包括原料供应、产品品种规格、重量、质量等）"
        rows="2"
        autosize
        :disabled="disabled || route.query.type != 1"
        type="textarea"
        maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入！' }]"
      />
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.handoverContent.operation"
        required
        name="operation"
        label="技术操作、设备运转（点检）等情况"
        rows="2"
        autosize
        :disabled="disabled || route.query.type != 1"
        type="textarea"
        maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入！' }]"
      />
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.handoverContent.safety"
        required
        name="safety"
        label="安全生产情况"
        rows="2"
        autosize
        :disabled="disabled || route.query.type != 1"
        type="textarea"
        maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入！' }]"
      />
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.handoverContent.cleanliness"
        required
        name="cleanliness"
        label="文明生产、工具交接情况"
        rows="2"
        autosize
        :disabled="disabled || route.query.type != 1"
        type="textarea"
        maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入！' }]"
      />
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.handoverContent.leaderInstruction"
        required
        name="leaderInstruction"
        label="上级领导指示"
        rows="2"
        autosize
        :disabled="disabled || route.query.type != 1"
        type="textarea"
        maxlength="200"
        placeholder="请输入"
        :rules="[{ required: true, message: '请输入！' }]"
      />
      <div class="title">签字确认</div>
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.shiftsUserSign"
        required
        name="shiftsUserSign"
        label="交班人签字"
        :rules="[{ required: route.query.type == 1, message: '请签字！' }]"
      >
        <template #input>
          <template v-if="!formData.shiftsUserSign">
            <template v-if="route.query.type == 1">
              <van-button @click="signClick('shiftsUserSign')" v-if="!userInfo.signature" type="primary">签字</van-button>
              <van-image v-else
                width="100"
                height="100"
                :src="userInfo.signature"
              />
            </template>
            <van-button v-else disabled type="primary">签字</van-button>
          </template>
          <van-image v-else
              width="100"
              height="100"
              :src="getFileAccessHttpUrl(formData.shiftsUserSign)"
            />
        </template>
      </van-field>
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.successionUserSign"
        required
        name="successionUserSign"
        label="接班人签字"
        :rules="[{ required: route.query.type == 2, message: '请签字！' }]"
      >
        <template #input>
          <template v-if="!formData.successionUserSign">
            <template v-if="route.query.type == 2">
              <van-button v-if="!userInfo.signature" @click="signClick('successionUserSign')" type="primary">签字</van-button>
              <van-image v-else
                width="100"
                height="100"
                :src="userInfo.signature"
              />
            </template>
            <van-button v-else disabled type="primary">签字</van-button>
          </template>
          <van-image v-else
            width="100"
            height="100"
            :src="getFileAccessHttpUrl(formData.successionUserSign)"
          />
        </template>
      </van-field>
      <van-field
        label-align="top"
        input-align="left"
        v-model="formData.leadersSign"
        required
        name="leadersSign"
        label="领导签字"
        :rules="[{ required: route.query.type == 3, message: '请输入作业内容！' }]"
      >
        <template #input>
          <template v-if="!formData.leadersSign">
            <template v-if="route.query.type == 3">
              <van-button v-if="!userInfo.signature" @click="signClick('leadersSign')" type="primary">签字</van-button>
              <van-image v-else
                width="100"
                height="100"
                :src="userInfo.signature"
              />
            </template>
            <van-button v-else disabled type="primary">签字</van-button>
          </template>
          <van-image v-else
            width="100"
            height="100"
            :src="getFileAccessHttpUrl(formData.leadersSign)"
          />
        </template>
      </van-field>
    </van-form>
    <div class="footer">
      <van-button @click="handleClose">取消</van-button>
      <van-button v-if="route.query.type == '3'" :loading="submitIng" type="primary" @click="handleSubmit">确认签字</van-button>
      <van-button v-if="route.query.type == '2'" :loading="submitIng" type="primary" @click="handleSubmit">确认接班</van-button>
      <van-button v-if="route.query.type == '1'" :loading="submitIng" type="primary" @click="handleSubmit">确认交班</van-button>
    </div>
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns="teamList" @cancel="showPicker = false" @confirm="onConfirm" />
    </van-popup>
    <van-dialog v-model:show="signShow" title="签名" @confirm="dialogConfirm" show-cancel-button>
      <Sign v-model:value="signature" />
    </van-dialog>
  </div>
</template>
<script lang="ts" setup>
  import { ref, reactive, onMounted } from 'vue'
  import { getTeam, handoverInfo, handoverSubmit, successorSign, leLeadersSign } from '../../../handoverWork/api';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { useUserStore } from '/@/store/modules/user'
  import { showConfirmDialog } from 'vant'
  import type { FormInstance } from 'vant';
  import { useRoute, useRouter } from 'vue-router'
  import Sign from "/@/views/app/components/sign.vue";
  const disabled = ref(false)
  const route: any = useRoute()
  const router: any = useRouter();
  const userStore = useUserStore()
  const userInfo: any = reactive(userStore.getUserInfo)
  const teamList = ref([])
  const showPicker = ref(false)
  const formRef = ref<FormInstance|null>(null);
  const signShow = ref(false)
  const signature = ref<String>('')
  onMounted(() => {
    pageInit()
  }) 
  function pageInit () {
    if(route.query.type == 0) {
      disabled.value = true
    }
    getTeam({
      orgCode: route.query.orgCode,
      workShopCode: route.query.workshop,
    }).then((res) => {
      teamList.value = res.map((item) => {
        return {
          text: item.sectionName,
          value: item.id,
        };
      });
    })
    handoverInfo({ id: route.query.id }).then((res) => {
      getTeam({
        orgCode: route.query.orgCode,
        workShopCode: route.query.workshop,
      }).then((res) => {
        teamList.value = res.map((item) => {
          return {
            text: item.sectionName,
            value: item.id,
          };
        });

      })
      Object.assign(formData, res);
      if(route.query.type == 1 && userInfo.signature) {
        formData.shiftsUserSign = userInfo.signature;
        let item: any = teamList.value.find((it:any) => {
          return it.value == userInfo.workSection
        });
        if(item) {
          formData.successionTeamId = userInfo.workSection;
          formData.successionTeamName = item.text;
        }
      }
      if(route.query.type == 2 && userInfo.signature) {
        formData.successionUserSign = userInfo.signature;
      }
      if(route.query.type == 3 && userInfo.signature) {
        formData.leadersSign = userInfo.signature;
      }
    })

  }

  const formData = reactive({
    id: '',
    teamId: '',
    teamName: '',
    sign: '',
    successionTeamId: undefined,
    successionTeamName: '',
    shiftsUserSign: '',
    successionUserSign: undefined,
    leadersSign: undefined,
    handoverContent: {
      production: '',
      operation: '',
      safety: '',
      cleanliness: '',
      leaderInstruction: '',
    },
  })
  const curSignKey = ref('');
  const signClick = (key) => {
    curSignKey.value = key;
    signShow.value = true;
  }
  const dialogConfirm = () => {
    formData.sign = signature.value;
    formData[curSignKey.value] = signature.value;
  }
  const submitIng = ref(false);
  const handleSubmit = () => {
    formRef.value?.validate().then(() => { 
      submitIng.value = true;
      let content = route.query.type == 1 ? '确认交班吗？' : route.query.type == 2 ? '确认接班吗？' : '确认签字提交吗？';
      showConfirmDialog({
        title: '提示',
        message: content,
      }).then(() => { 
        if(route.query.type == 1) {
          handoverSubmit(formData).then(() => {
            submitIng.value = false;
            router.back();
          });
        }
        if(route.query.type == 2) {
          successorSign({
            id: formData.id,
            sign: formData.successionUserSign
          }).then(() => {
            submitIng.value = false;
            router.back();
          });
        }
        if(route.query.type == 3) {
          leLeadersSign({
            id: formData.id,
            sign: formData.leadersSign
          }).then(() => {
            submitIng.value = false;
            router.back();
          });
        }

      }).catch(() => {
        // on cancel
      });
      
    });
  }
  const openPicker = (key) => { 
    if(route.query.type != 1) return;
    showPicker.value = true;
  }
  const onConfirm = (e) => {
    formData.successionTeamId = e.selectedOptions[0].value;
    formData.successionTeamName = e.selectedOptions[0].text;
    showPicker.value = false;
  }
  const handleClose = () => {
    router.back();
  }
</script>
<style lang="less" scoped>
// 若上述不生效，可提高优先级（针对 Field 组件根元素）
.van-field {
  --van-field-input-disabled-text-color: #333 !important;
}
.detail{
  width: 100%;
  height: auto;
  padding-bottom: 145px;
  .title{
    font-size: 16px;
    font-weight: bold;
    padding: 8px 16px;
    background: linear-gradient(to right, #a2cefa, #d1e5f8);
    border-left: 5px solid #1989fa;
  }
  .footer{
    height: 45px;
    width: 100%;
    background-color: #ffffff;
    display: flex;
    justify-content: space-around;
    align-items: center;
    position: fixed;
    bottom: 0;
  }
  :deep(.van-field__control:disabled){
    input{
      color: #333 !important;
    }
    color: #333 !important;
  }
  :deep(.van-field--disabled .van-field__label){
    color: #333 !important;
  }
}
</style>
