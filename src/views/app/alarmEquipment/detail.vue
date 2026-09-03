<template>
  <div class="equipment-detail">
      <van-form label-width="130">
        <van-field readonly name="orgName" label="所属机构：">
          <template #input>
            {{ route.query.departName }}
          </template>
        </van-field>
        <van-field readonly name="module" label="设备名称：">
          <template #input>
            {{ route.query.deviceName }}
          </template>
        </van-field>
        <van-field readonly name="location" label="当前状态：">
          <template #input
            ><span class="tag bl" v-if="route.query.enableFlag == 0">启用</span
            ><span v-if="route.query.enableFlag == 1" class="tag nor">禁用</span></template
          >
        </van-field>
      </van-form>
    <div class="main">
        <p class="tit">历史记录</p>
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-steps direction="vertical" :active="0">
            <van-step v-for="item in detailInfo">
              <div
                ><span>{{ item.createTime }}</span
                ><span>{{ item.updateByRealName }}</span></div
              >
              <p :class="{ qy: item.enableFlag == 0 }">{{ ['启用', '禁用'][item.enableFlag] }}</p>
              <template v-if="item.enableFlag == 0">
                <p>启用开始时间：{{ item.startTime }}</p>
                <p>报警启用原因：{{ item.reason }}</p>
              </template>
              <template v-else>
                <p>禁用时间：{{ item.startTime }}至{{ item.endTime }}</p>
                <p>禁用报警原因：{{ item.reason }}</p>
              </template>
            </van-step>
          </van-steps>
        </van-list>
    </div>
  </div>
</template>
<script lang="ts" setup name="AppAlarmEquipmentDetail">
  import { reactive, ref } from 'vue';
  import { pageListByWarnDevice } from './index.api';
  import { useRoute } from 'vue-router';
  const route = useRoute();
  const detailInfo = ref<any>([]);
  
  const loading = ref(false);
  const pageNo = ref(1);
  const finished = ref(false);

  const onLoad = () => { 
    pageNo.value++;
    getDetail();
  };

  const getDetail = () => {
    pageListByWarnDevice({
      id: route.query.deviceId,
      pageNo: pageNo.value,
      pageSize: 10,
    })
      .then((res) => {
        detailInfo.value = [...detailInfo.value, ...res.records];
        loading.value = false;
        if(detailInfo.value.length >= res.total){
          finished.value = true;
        }
      })
      .catch(() => {
        loading.value = false;
      });
  };
  getDetail();
</script>

<style lang="less" scoped>
  .equipment-detail {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .main {
      flex: 1;
      overflow-y: auto;
    }
  }
  .tag {
    font-size: 12px;
    display: inline-block;
    background-color: #f76262;
    color: #fff;
    font-size: 10px;
    border-radius: 4px;
    padding: 0 4px;
    margin-left: 10px;
  }
  .qy {
    color: rgba(0, 179, 125, 1);
  }

  .bl {
    background-color: rgba(0, 179, 125, 1);
  }

  .tit {
    padding: 0 15px;
    color: #1989fa;
  }

  .or {
    background-color: #f7aa36;
  }
  .nor {
    background-color: #f76262;
  }
</style>
