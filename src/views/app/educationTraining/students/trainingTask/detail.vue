<template>
  <div class="taskDetail" v-loading="loading" v-watermark>
    <div class="hd">
      <div>任务总进度</div>
      <h1>{{ detailInfo.finishRate || 0 }}%</h1>
      <div class="bt">
        <span>任务周期：</span>
        {{ detailInfo && detailInfo.taskStrTime && detailInfo.taskStrTime.substr(0, 16) }} ~
        {{ detailInfo && detailInfo.taskStrTime && detailInfo.taskEndTime.substr(0, 16) }}
      </div>
    </div>
    <DetailList @signed="pageInit" @changeClass="itemClick"
      :taskStatus="detailInfo.status" 
      :id="detailInfo.taskId" :contentList="detailInfo.contentList" />
    <!-- <StudyView ref="studyViewRef" :currentClass="currentClass" v-show="studying" /> -->
  </div>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DetailList from '../components/detailList.vue';
  import { trainTaskInfo, getResourceUrl } from '../../index.api';
  import { setAppTitle } from '/@/utils/index';
  import { useRoute } from 'vue-router';
  import StudyView from '../study/index.vue';
  const route = useRoute();

  const detailInfo = ref<any>({contentList: []});
  const studying = ref(false);
  const currentClass = ref({});
  const resourceUrl = ref({})
  const studyViewRef = ref<InstanceType<typeof StudyView>>()
  const loading = ref(false);
  pageInit();
  function pageInit() {
    loading.value = true;
    trainTaskInfo({ id: route.query.id }).then((res) => {
      console.log(res);
      detailInfo.value = res;
      setAppTitle(res.taskName);
    }).finally(() => {
      loading.value = false;
    });
  }

  const itemClick = async ({contentId, resourceId, cidx}) => {
    console.log(contentId, resourceId, cidx);
    
    let res = await getResourceUrl({
      taskId: route.query.id,
      contentId: contentId,
      resourceId: resourceId,
    });
    console.log(res);
    studying.value = true;
    studyViewRef.value?.pageInit(res.courseList[cidx])
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
