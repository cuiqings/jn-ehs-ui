<template>
  <div class="detecriononline-detail">
    <div class="hd"> 设备名称：{{ $route.query.name }} </div>
    <div class="main">
      <van-list>
        <van-cell is-link v-for="item in detailInfo.realTimeDataPoints" @click="goPage(item)" :key="item" :title="item">
          <template #title>
            <div class="title">{{item.pointName}}<span>{{getNumTwo(item.pointValue)}}</span></div>
          </template>
          <!-- <template #label>封疆大吏发卡机发</template> -->
        </van-cell>
        <van-cell @click="goPage" is-link v-for="item in detailInfo.warnStatusPoints" :key="item" :title="item">
          <template #title>
            <div class="title">{{item.pointName}}<span>{{getNumTwo(item.pointValue)}}</span></div>
          </template>
          <!-- <template #label>封疆大吏发卡机发</template> -->
        </van-cell>
        <van-cell @click="goPage" is-link v-for="item in detailInfo.workStatusPoints" :key="item" :title="item">
          <template #title>
            <div class="title">{{item.pointName}}<span>{{getNumTwo(item.pointValue)}}</span></div>
          </template>
          <!-- <template #label>封疆大吏发卡机发</template> -->
        </van-cell>
      </van-list>
    </div>
  </div>
</template>

<script lang="ts" setup name="AppDetecrionOnlineDetail">
import { energyRegionDevicePointView  } from './index.api';
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
const router = useRouter();
const route = useRoute();
const goPage = (item) => {
  router.push({path: '/app/detecrionOnlineDataDetail', query: item})
}

const detailInfo = ref({});
pageInit();
function pageInit() {
  energyRegionDevicePointView({
    deviceId: route.query.deviceId
  }).then(res => {
    detailInfo.value = res;
  })
  
}
// 保留小数
function getNumTwo(num_0, n = 2) {
  if (isNaN(num_0)) {
    return num_0;
  }
  let num = Number(num_0);
  var f = parseFloat(num);
  f = Math.round(num * Math.pow(10, n)) / Math.pow(10, n); // n 幂
  var s = f.toString();
  return s;
}



</script>

<style lang="less" scoped>
  .detecriononline-detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .hd {
      height: 50px;
      line-height: 50px;
      font-size: 16px;
      padding: 0 20px;
      box-sizing: border-box;
      border-bottom: 1px solid #eee;
    }
    .main {
      flex: 1;
      overflow: auto;
      .title {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
