<template>
  <div class="myTask">
    <section>
      <van-tabs v-model:active="activeName" @click-tab="myTab">
        <van-tab title="全部" name="a">
          <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad1">
            <div class="mytask-list" @click="onMyTask(1, 'f3ecd630f48171eb10a7480659f25dd7')">
              <div class="list-title">
                <span class="label">填报</span>
                <p class="list-text">长期任务-2月28日汇报</p>
              </div>
              <p class="list-date">任务时间：2023-05-23 02:54:13</p>
            </div>
            <div class="mytask-list" @click="onMyTask(2, '10c9abb0ac1771ff182dbf75296b167a')">
              <div class="list-title">
                <span class="label">审批</span>
                <p class="list-text">任务汇报验收审核</p>
              </div>
              <p class="list-date">任务时间：2023-05-22 03:46:13</p>
            </div>
          </van-list>
        </van-tab>
        <van-tab title="待处理" name="b"> b </van-tab>
        <van-tab title="已处理" name="c">
          <div class="mytask-box">
            <div class="mytask-list">
              <div class="list-title">
                <span class="label">填报</span>
                <p class="list-text">长期任务-2月28日汇报</p>
              </div>
              <p class="list-date">任务时间：2023-05-23 02:54:13</p>
            </div>
          </div>
        </van-tab>
      </van-tabs>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { cycleDetail, process1App1 } from './appTask.api';
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  const activeName = ref('a');
  const loading = ref(false);
  const finished = ref(false);
  const listData1 = ref([]);
  const publishId = ref('');

  //下拉加载
  const onLoad1 = () => {
    // 加载状态结束
    loading.value = false;
  };
  //填报/审批的跳转详情
  const onMyTask = (label, staId) => {
    // console.log(label, staId);
    goDetail(staId);
    setTimeout(() => {
      router.push({ name: 'AppTaskDetail', query: { label: label, id: publishId.value, staId: staId} });
    }, 1000);
  };
  //获取tab的title
  const myTab = ({ title }) => {
    // console.log({title});
  };

  //周期详情
  async function goDetail(id) {
    await cycleDetail(id).then((res) => {
      //console.log(res);
      publishId.value = res.publishId;
    });
  }
</script>

<style lang="less" scoped>
  .myTask {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    section {
      flex: 1;
      background: #eff1f5;

      .mytask-list {
        width: 93%;
        height: 90px;
        border-radius: 3%;
        background-color: white;
        margin: 3% auto;
        padding: 4%;

        .list-title {
          display: flex;

          // align-items: center;
          .label {
            width: 10%;
            height: 10%;
            text-align: center;
            margin-right: 1%;
            color: #3e87f8;
            border-radius: 1.6px;
            background-color: #ddebfe;
            margin-top: 3px;
          }

          .list-text {
            font-size: 18px;
          }
        }

        .list-date {
          margin-top: -12px;
          color: #999;
        }
      }
    }
  }
</style>
