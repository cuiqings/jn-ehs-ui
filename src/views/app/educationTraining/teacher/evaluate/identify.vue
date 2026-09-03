<template>
  <div class="identify">
    <h1>考试验证</h1>
    <div v-if="!userStore.getUserInfo.phone">
      <div class="ntit"> 您还没有在平台录入手机号码，请先完善个人信息！ </div>
      <div class="foot">
        <van-button size="small" block @click="back" type="primary">返回</van-button>
      </div>
    </div>
    <template v-else>
      <div class="info"> 请确认本人参加考试，使用参加人系统预留（证件号/手机号）进行验证：</div>
      <div class="phone">{{ phoneHide(userStore.getUserInfo.phone) }}</div>
      <van-form ref="validform" label-width="85">
        <van-field
          v-if="route.query.checkCardId == 'true'"
          v-model="idNumber"
          label="身份证号"
          name="idNumber"
          required
          placeholder="请输入"
          :rules="[{ validator, trigger: 'onChange', message: '请输入正确的身份证号！' }]"
        />
        <van-field required v-model="sms" center clearable label="短信验证码" placeholder="请输入短信验证码"
        :rules="[{ required: true, message: '请获取验证码！' }]">
          <template #button>
            <van-button size="small" @click="getCaptcha" type="primary" :disabled="(text === '获取验证码' ? false : true) || !canCode">{{ text }}</van-button>
          </template>
        </van-field>
        <div class="foot">
          <van-button :disabled="!canCode" size="small" block @click="go" type="primary">确定</van-button>
        </div>
      </van-form>
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { useRoute, useRouter } from 'vue-router';
  import { ref, watch } from 'vue';
  import { sendSms, startExam, checkCardNo } from '../../index.api';
  import { useUserStore } from '/@/store/modules/user';
  const userStore: any = useUserStore();
  const router = useRouter();
  const route = useRoute();
  const text = ref('获取验证码');
  const sms = ref('');
  const idNumber = ref('');
  const validform = ref(null);
  const go = async () => {
    await validform.value?.validate();
    startExam({
      contentId: route.query.contentId,
      source: route.query.source,
      code: sms.value,
      taskId: route.query.taskId,
    }).then((res) => {
      router.replace({ path: `/app/student/exam`, query: route.query });
      sessionStorage.setItem('examPaper', JSON.stringify(res));
      sessionStorage.setItem('identify', 'true');
    });
  };
  const canCode = ref(false);
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
  const validator = async (val) => {
    const reg = /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[1-2]\d|3[0-1])\d{3}[\dX]$/;
    const res = reg.test(val);
    console.log(reg.test(val));
    if(res){
      checkCardNo({
        cardNo: val
      }).then((res) => {
          canCode.value = true; 
          return Promise.resolve(true)
      }).catch(err => {
        return Promise.resolve('身份证号码与当前用户不匹配，请查证后再试！')
      })
    } else {
      canCode.value = false; 
      return Promise.resolve('身份证号码格式不正确')
    }

    
  };
  // 手机号做脱敏处理
  function phoneHide(phone) {
    let reg = /^(1[3-9][0-9])\d{4}(\d{4}$)/; // 定义手机号正则表达式
    phone = phone.replace(reg, '$1****$2');
    return phone;
  }
  function back() {
    router.go(-1);
  }
  if(!route.query.checkCardId || route.query.checkCardId != 'true'){
    canCode.value = true;
  }
 
</script>
<style lang="less" scoped>
  .identify {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    h1 {
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 10px;
      text-align: center;
    }
    .info {
      text-indent: 2em;
    }
    .phone {
      font-size: 16px;
      font-weight: 600;
      margin: 10px 0;
      text-indent: 2em;
    }
    .foot {
      margin-top: 20px;
    }
    .ntit {
      margin: 30px 0 50px 0;
    }
  }
</style>
