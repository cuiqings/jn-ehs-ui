<template>
  <div class="hiddendanger">
    <List
      :listType="2"
      :total="total1"
      ref="listRef1"
      :immediateCheck="false"
      @openDetail="openDetail"
      :list="list"
      @onLoad="onLoad"
      @onRefresh="onRefresh"
    />
  </div>
</template>
<script lang="ts" setup>
  import { ref, nextTick, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { studyList } from '../../index.api';
  import List from '../components/list.vue';
  import { useAppStore } from '/@/store/modules/app';

  const appStore = useAppStore();

  const router = useRouter();
  const list = ref<any[]>([]);
  const loading = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef1 = ref();
  const total1 = ref(0);

  const onRefresh = async (params) => {
    const res = await getList(params).catch(() => {
      listRef1.value.refreshEnd(list.value.length>=total1.value);
    });
    list.value = res.records;
    total1.value = res.total;
    listRef1.value.refreshEnd(list.value.length>=res.total);
  };

  const onLoad = async (params) => {
    const res = await getList(params).catch(() => {
      listRef1.value.loadEnd(list.value.length>=total1.value);
    });
    loading.value = false;
    list.value = [...list.value, ...res.records];
    total1.value = res.total;
    listRef1.value.loadEnd(list.value.length>=res.total);
  };

  onMounted(() => {
    // 首次加载列表
    onLoad({});
  });

  function getList(params?) {
    return studyList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  // 卡片跳转
  const openDetail = (item) => {
    let query = { id: item.taskId};
    router.push({ path: '/app/student/trainingTaskDetail', query: query });
  };
  
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    padding: 10px 15px;
    overflow-y: scroll;

    // .tab-inner {
    //   height: calc(100vh - 44px);
    // }

    .add-btn {
      position: fixed;
      bottom: 30px;
      right: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background-color: #1989fa;
      border-radius: 50%;
    }

    .add {
      width: 36px;
      height: 36px;
      transform: translateY(-2px);
    }
  }
</style>
