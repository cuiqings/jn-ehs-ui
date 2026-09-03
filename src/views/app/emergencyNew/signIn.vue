<template>
  <div class="signIn">
    <div class="tit">{{ route.query.name }}</div>
    <div class="sign">
      <Sign v-model:value="signature" />
    </div>
    <div class="foot">
      <van-button type="primary" style="padding: 18px 0;width: 80%;" round block @click="submitSign">确认签到</van-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Sign from '../components/sign.vue'
import { useRoute, useRouter } from 'vue-router';
import { signIn } from '/@/views/emergencyNew/api'
import { ref } from 'vue'
import { showToast } from 'vant';
import uni from "@dcloudio/uni-webview-js"
const route = useRoute()
const router = useRouter()
const signature = ref<string>()
const submitSign = () => {
  if (!signature.value) {
    showToast({ message: '请签字', position: 'top' })
    return;
  }
  signIn({
    id: route.query.id,
    sign: signature.value
  }).then(_ => {
    uni.webView.postMessage({ data: { action: 'toBack' } });
  })
}
</script>
<style lang="less" scoped>
.signIn {
  width: 100%;
  height: 100%;
  background-color: #fff;
  padding: 15px;
  text-align: center;

  .tit {
    font-size: 16px;
    font-weight: 600;
    margin: 16px 0;
  }

  .sign {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 50px 0;
  }

  .foot {
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: center;
    position: absolute;
    bottom: 20px;
    left: 0;
  }
}
</style>
