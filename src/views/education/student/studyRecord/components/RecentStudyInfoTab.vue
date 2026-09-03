<template>
  <div>
    <!-- 卡片区域 -->
    <div style="clear: both" v-if="listData.length > 0">
      <div class="study-list">
        <div
          class="study-item"
          v-for="(item, index) in listData"
          :key="item.taskId"
          :style="{ marginRight: (index + 1) % 3 == 0 ? '0px' : '20px' }"
          @click="goDetail(item)"
        >
          <img :src="coursrImg" alt="" />
          <div class="conent">
            <div class="title">
              <span class="label">{{ item.taskName }}</span>
            </div>
            <!-- <div class="last-study">上次学到：抛丸标准化操作指导视频</div> -->
            <div><a-progress :percent="Number(item.finishRate)" /></div>
          </div>
        </div>
      </div>
    </div>
    <a-empty v-else description="暂无数据" style="position: relative; top: 20px" />
    <!-- 分页 -->
    <div class="page-wrap" v-if="listData.length > 0">
      <a-pagination
        v-model:current="current"
        :page-size-options="pageSizeOptions"
        v-model:page-size="pageSize"
        :total="total"
        show-size-changer
        @change="onChange"
        @show-size-change="onShowSizeChange"
      />
    </div>
  </div>
  <TriningDetail @register="register" />
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getCourseList } from '../studyRecord.api';
import { Pagination } from 'ant-design-vue';
import coursrImg from '/@/assets/images/exam/course-cover.jpeg';
import { useDrawer } from '/@/components/Drawer';
import TriningDetail from '../../myTrining/triningDetail.vue';
const APagination = Pagination;
const props = defineProps({
  currentKey: { require: true, type: String },
});
const [register, { openDrawer }] = useDrawer();
const current = ref(1);
const pageSize = ref(4);
const loading = ref(false);
const pageSizeOptions = ref<string[]>(['4', '8', '12', '16', '20']);
const total = ref(60);
const listData = ref([]);
loadData(1);
watch(
  () => props.currentKey,
  () => loadData(1)
);
async function loadData(arg) {
  if (arg === 1) {
    current.value = 1;
  }
  loading.value = true;
  let param = {};
  param['pageNo'] = current.value;
  param['pageSize'] = pageSize.value;
  await getCourseList(param).then((res) => {
    listData.value = res.records;
    total.value = res.total;
    loading.value = false;
  });
}
const onShowSizeChange = () => {
  loadData(0);
};
const onChange = () => {
  loadData(0);
};
const goDetail = (item) => {
  openDrawer(true, item);
  // router.push(`/student/myTriningDetail?id=${id}`)
};
</script>

<style lang="less" scoped>
.study-list {
  .study-item {
    display: flex;
    width: 80%;
    border: 1px solid #f0f0f0;
    border-radius: 5px;
    margin-bottom: 20px;
    padding: 10px;
    img {
      width: 160px;
      height: 100px;
      border-radius: 5px;
      margin-right: 20px;
    }
    .title {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      .label {
        font-size: 16px;
        font-weight: 600;
      }
    }
    .last-study {
      margin-bottom: 10px;
      color: #666;
    }
  }
}
.page-wrap {
  float: right;
  margin-top: 20px;
  height: 50px;
}
</style>