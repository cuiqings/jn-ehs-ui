<template>
  <div class="app-task-wrap">
    <van-tabs v-model:active="activeName" @click-tab="onClickTab">
      <van-tab title="任务信息" name="a">
        <TaskInfo :pageId="pageId" />
      </van-tab>
      <van-tab title="执行记录" name="b">
        <ExecuteRecord :pageId="pageId" />
      </van-tab>
      <van-tab title="异常记录" name="c">
        <AbnormalRecord :pageId="pageId" />
      </van-tab>
    </van-tabs>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from 'vue';
// import { showDialog } from 'vant';
// import { getDetail } from './app.api';
// import { initDictOptions } from '/@/utils/dict';
// import { filterMultiDictText } from '/@/utils/dict/JDictSelectUtil.js';
import { useRouter } from 'vue-router';
import TaskInfo from './components/TaskInfo.vue'
import ExecuteRecord from './components/ExecuteRecord.vue'
import AbnormalRecord from './components/AbnormalRecord.vue'
import { setAppTitle } from '/@/utils/index';
const router = useRouter();
const { currentRoute } = router;
const pageId:any = ref('')
pageId.value = currentRoute.value.query.id
// const dictOptionsType = ref<any>([]);
const activeName = ref('a');
// const dataList:any = ref([])
/**
 * 初始化字典选项
 */
// async function initDictConfig() {
//   dictOptionsType.value = await initDictOptions('clean_plan_type');
// }
// loadData();
onMounted(() => {
  setAppTitle()
  //初始化字典选项
  // initDictConfig();
});

// function loadData(){
//   getDetail({id:pageId.value}).then((res:any) => {
//     // console.log(res)
//     dataList.value = res.records
//   })
// }

const onClickTab = ({ title }) => {
  if (title == '任务信息') {}
}



</script>
<style lang="less" scoped>
.app-task-wrap {
  width: 100%;
  height: 100%;
  // overflow-y: auto;
  background: #eff1f5;
  padding-bottom: 70px;
  
}
</style>