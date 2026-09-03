<template>
  <BasicModal @register="registerThis" v-bind="$attrs" title="考试验证">
    <div v-if="!userStore.getUserInfo.phone"> 您还没有在平台录入手机号码，请先完善个人信息！ </div>
    <div class="main" v-else>
      <a-form :model="formData"  :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <div class="info"> 请确认本人参加考试，使用参加人系统预留（证件号/手机号）进行验证：</div>
        <div class="phone">{{ phoneHide(userStore.getUserInfo.phone) }}</div>
        <a-row :gutter="24" v-if="currentItem.checkCardId">
          <a-col class="gutter-row" :span="24">
            <a-form-item
              label="身份证号"
              name="idNumber"
              :rules="[
                {
                  required: true,
                  message: '请输入正确的身份证号!',
                  trigger: 'change',
                  validator: idNumberValidate
                },
              ]"
            >
              <a-input @change="idcodeChange" v-model:value="formData.idNumber" placeholder="请输入" />
            </a-form-item>
          </a-col>
        </a-row>
        <van-field required label-width="90" label-align="right" v-model="sms" center label="短信验证码:" placeholder="请输入短信验证码">
          <template #button>
            <van-button size="small" @click="getCaptcha" type="primary" :disabled="(text === '获取验证码' ? false : true) || !canCode">{{ text }}</van-button>
          </template>
        </van-field>
      </a-form>
    </div>
    <template #footer>
      <a-button :disabled="!canCode" type="primary" @click="go">确定</a-button>
    </template>
  </BasicModal>
</template>
<script lang="ts" setup>
  import { useRouter } from 'vue-router';
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { sendSms, startExam, checkCardNo } from '/@/views/app/educationTraining/index.api';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const router = useRouter();
  const currentItem = ref({});
  const [registerThis, { closeModal }] = useModalInner((item) => {
    currentItem.value = item;
    if(!item.checkCardId){
      canCode.value = true;
    }
  });
  const text = ref('获取验证码');
  const sms = ref('');
  const formData = ref({
    idNumber: ''
  });

  const go = () => {
    if (!userStore.getUserInfo.phone) {
      closeModal();
      return;
    }
    startExam({
      code: sms.value,
      source: currentItem.value.source,
      taskId: currentItem.value.taskId,
      contentId: currentItem.value.contentId,
    }).then((res) => {
      router.push(`/exam?taskId=${currentItem.value.taskId}`);
      sessionStorage.setItem('examPaper', JSON.stringify(res));
      sessionStorage.setItem('identify', 'true');
    });
  };

  const getCaptcha = async () => {
    let n = 60;
    text.value = n + '秒钟重新获取';
    const timer = setInterval(() => {
      if (n === 0) {
        clearInterval(timer);
        text.value = '获取验证码';
      } else {
        n--;
        text.value = n + '秒钟重新获取';
      }
    }, 1000);
    codeRequest();
  };
  const codeRequest = async () => {
    const res = await sendSms();
  };

  // 手机号做脱敏处理
  function phoneHide(phone) {
    if (!phone) return;
    let reg = /^(1[3-9][0-9])\d{4}(\d{4}$)/; // 定义手机号正则表达式
    phone = phone.replace(reg, '$1****$2');
    return phone;
  }
  const canCode = ref(false);
  const idNumberValidate = (_, value) => {
    let reg = /^(([1][1-5])|([2][1-3])|([3][1-7])|([4][1-6])|([5][0-4])|([6][1-5])|([7][1])|([8][1-2]))\d{4}(([1][9]\d{2})|([2]\d{3}))(([0][1-9])|([1][0-2]))(([0][1-9])|([1-2][0-9])|([3][0-1]))\d{3}[0-9xX]$/;
    let res = reg.test(value)
    console.log(value);
    if(res){
      checkCardNo({
        cardNo: value
      }).then((res) => {
          canCode.value = true; 
          return Promise.resolve(true)
      }).catch(err => {
        canCode.value = false;
        return Promise.reject('身份证号码与当前用户不匹配，请查证后再试！')
      })
    } else {
      canCode.value = false;
      return Promise.reject('身份证号码格式不正确')
    }
  }

  const idcodeChange = (val) => {
    console.log(val);
    
  }
</script>
<style lang="less" scoped>
  .main {
    width: 100%;
    height: 300px;
    overflow-y: auto;
    padding: 0 16px;
  }
  .phone {
    margin-bottom: 20px;
    font-size: 16px;
    font-weight: 600;
  }
  .record-item {
    width: 100%;
    height: 44px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding-bottom: 20px;
    .left {
      width: auto;
      display: flex;
      height: 22px;
      align-items: center;
      .date {
        height: 22px;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 22px;
        margin-right: 40px;
      }
      .status {
        width: 70px;
        height: 22px;
        display: flex;
        align-items: center;
        font-size: 14px;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.88);
        line-height: 22px;
        .error {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 8px;
          background: #1890ff;
        }
      }
    }
    .right {
      width: auto;
      height: 22px;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.88);
      line-height: 22px;
    }
  }
  :deep(.van-field__body) {
    input {
      height: 33px;
      border: 1px solid #d9d9d9;
      border-radius: 2px;
      padding-left: 11px;
    }
  }
  :deep(.van-field__label) {
    margin-right: 9px;
  }
</style>
