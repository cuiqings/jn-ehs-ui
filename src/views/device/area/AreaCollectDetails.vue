<template>
  <div class="device-details">
    <div class="btn-back">
      <a-button size="small" type="primary" ghost @click="goBackPage">返回</a-button>
    </div>
    <div class="d-title">
      <div class="dt-left">
        {{ params.name }}
        <span class="name_ban1_tip_0" v-if="params.status == 0">离线</span>
        <span class="name_ban1_tip_1" v-if="params.status == 1">在线</span>
        <span class="name_ban1_tip_2" v-if="params.status == 2">报警</span>
      </div>
      <div class="dt-right">
        <a-tabs v-model:activeKey="activeKey" @change="onTabChange" :tabBarStyle="tabBarStyle">
          <a-tab-pane key="0" tab="设备实时数据" />
          <!-- <a-tab-pane key="1" v-if="userInfo.username!=='huanbaojv'" tab="设备实景" /> -->
          <a-tab-pane key="2" v-if="userInfo.username!=='huanbaojv'" tab="设备报警记录" />
          <a-tab-pane
            v-if="params.name === '一号线RCO1' || params.name === '一号线RCO2' || params.name === '一号线RCO3'"
            key="3"
            tab="吸附脱附温度"
          />
        </a-tabs>
      </div>
    </div>
    <div class="d-main">
      <real-time :params="params" v-if="activeKey === '0'" />
      <device-screen :params="params" v-if="activeKey === '1'" />
      <warn-record :params="params" v-if="activeKey === '2'" />
      <adsorption-temperature :params="params" v-if="activeKey === '3'" />
    </div>
  </div>
</template>
  
<script lang="ts" setup>
import { reactive, ref, computed } from 'vue';
import DeviceScreen from './components/DeviceScreen.vue';
import RealTime from './components/RealTime.vue';
import WarnRecord from './components/WarnRecord.vue';
import AdsorptionTemperature from './components/AdsorptionTemperature.vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '/@/store/modules/user';
const userStore: any = useUserStore();
const userInfo = computed(() => userStore.getUserInfo);
const router = useRouter();
const route: any = useRoute();
console.log('route.params', route.query);
const params = reactive({ ...route.query });
const activeKey = ref('0');
const tabBarStyle = reactive({
  position: 'absolute',
  //   bottom: '-1px',
  top: '35px',
  right: '20px',
  marginBottom: 0,
});
const onTabChange = (key: string) => {
  activeKey.value = key;
};
const goBackPage = () => {
  console.log('goBackPage');
  router.push({
    path: '/area/collect',
  });
};
</script>
  
 <style lang="less" scoped>
.device-details {
  background-color: #fff;
  margin: 10px;
  position: relative;
  .btn-back {
    position: absolute;
    top: 10px;
    right: 23px;
  }
  .d-title {
    border-bottom: 1px solid #e8e8e8;
    display: flex;
    padding-left: 24px;
    .dt-left {
      flex: 1;
      line-height: 80px;
      font-size: 18px;
      > span {
        padding: 0px 4px;
        line-height: 21px;
        background: rgba(9, 193, 153, 0.15);
        border-radius: 2px;
        color: #09c199;
        font-size: 13px;
        margin-left: 6px;
        display: inline-block;
        &.name_ban1_tip_0 {
          background: #dadcdf;
          color: rgba(0, 0, 0, 0.38);
        }
        &.name_ban1_tip_1 {
          background: rgba(9, 193, 153, 0.15);
          color: #09c199;
        }
        &.name_ban1_tip_2 {
          color: #cd2b1d;
          background: rgba(205, 43, 29, 0.15);
        }
      }
    }
    .dt-right {
      flex: 1;
      > div {
        height: 100%;
      }
    }
  }
}
</style>