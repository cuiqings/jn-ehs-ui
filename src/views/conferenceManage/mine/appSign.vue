<template>
  <div class="signIn">
    <div class="tit">{{ route.query.name }}</div>
    <div class="sign">
        <Sign v-model:value="signature" />
    </div>
    <div class="foot">
        <van-button :loading="submitIng" type="primary" style="padding: 18px 0;width: 80%;" round block @click="submitSign">确认签到</van-button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import Sign from '../../app/components/sign.vue'
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref } from 'vue'
import { sign } from './url/index';
import { showToast } from 'vant';
import uni from "@dcloudio/uni-webview-js"
const route = useRoute()
const router = useRouter()
const signature = ref<string>()
const submitIng = ref(false)
const startTime = ref<number>(0);
const endTime = ref<number>(0);

const submitSign = () => {
  let now = new Date().getTime();
  if(route.query.snum && route.query.startDate) {
    startTime.value = new Date(route.query.startDate as string).getTime() - ((route.query.snum as number) * 60 * 1000)
  }
  if(route.query.enum && route.query.endDate) {
    endTime.value = new Date(route.query.endDate as string).getTime() + ((route.query.enum as number) * 60 * 1000)
  }
  if(now < startTime.value) {
    showToast({message: `签到时间未到`, position: 'top'})
    return;
  }
  if(now > endTime.value) {
    showToast({message: `签到时间已过`, position: 'top'})
    return;
  }
  if(!signature.value) {
    showToast({message: '请签字', position: 'top'})
    return;
  }
  submitIng.value = true
  sign({
    id: route.query.id,
    sign: signature.value
  }).then(_ => {
    try {
      uni.webView.postMessage({data:{action: 'toBack'}});
    } catch (e) {
      router.back()
    }
  }).finally(() => {
    submitIng.value = false
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
