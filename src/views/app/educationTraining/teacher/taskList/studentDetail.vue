<template>
    <div class="taskDetail">
      <!-- <div class="hd">
        <div>任务总进度</div>
        <h1>{{ detailInfo.finishRate || 0 }}%</h1>
        <div class="bt">
          <span>任务周期：</span>
          {{ detailInfo && detailInfo.taskStrTime && detailInfo.taskStrTime.substr(0, 16) }} ~
          {{ detailInfo && detailInfo.taskStrTime && detailInfo.taskEndTime.substr(0, 16) }}
        </div>
      </div> -->
      <DetailList @signed="pageInit" :id="detailInfo.taskId" :contentList="detailInfo" />
    </div>
  </template>
  
  <script lang="ts" setup>
    import { ref } from 'vue';
    import DetailList from '../components/detailList.vue';
    import { trainManagementDetail } from '../../index.api';
    import { useRoute } from 'vue-router';
    const route = useRoute();
  
    const detailInfo = ref<any>({contentList: []});
  
    pageInit();
    function pageInit() {
      trainManagementDetail({ id: route.query.id, userId: route.query.userId }).then((res) => {
        console.log(res);
        detailInfo.value = res;
        // setAppTitle(res.taskName);
      });
    }
  
  </script>
  
  <style lang="less" scoped>
    .taskDetail {
      width: 100%;
      height: 100%;
      padding: 10px 16px;
      .hd {
        height: 30%;
        background-color: #1890ff;
        border-radius: 10px;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px 16px;
        justify-content: space-between;
        h1 {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
        }
        .bt {
          width: 100%;
          background-color: rgba(255, 255, 255, 0.1);
          padding: 10px;
          border-radius: 10px;
          font-size: 12px;
          text-align: center;
          span{
            color: rgba(255, 255, 255, 0.8);
          }
        }
      }
    }
  </style>
  