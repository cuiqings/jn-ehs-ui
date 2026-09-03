<template>
  <div class="hiddendanger" v-loading="loading">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="全部任务" name="1">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total1"
            ref="listRef1"
            :immediateCheck="true"
            @openDetail="openDetail"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="未开始" name="2">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="进行中" name="3">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total3"
            :needBtn="false"
            ref="listRef3"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list3"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="已结束" name="4">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total4"
            :needBtn="false"
            ref="listRef4"
            :immediateCheck="false"
            @openDetail="openDetail"
            :list="list4"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script lang="ts" setup>
  import { ref, nextTick, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { trainPageList } from '../../index.api';
  import List from '../components/list.vue';
  import { useAppStore } from '/@/store/modules/app';

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);

  const router = useRouter();
  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  const list4 = ref<any[]>([]);
  const loading = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef1 = ref();
  const listRef2 = ref();
  const listRef3 = ref();
  const listRef4 = ref();
  const total1 = ref(0);
  const total2 = ref(0);
  const total3 = ref(0);
  const total4 = ref(0);

  const onRefresh = async (params) => {
    const res = await getList(params).catch(() => {
      if (active.value == '1') {
        listRef1.value.refreshEnd(list.value.length>=total1.value);
      } else if (active.value == '2') {
        listRef2.value.refreshEnd(list2.value.length>=total2.value);
      } else if (active.value == '3') {
        listRef3.value.refreshEnd(list3.value.length>=total3.value);
      } else if (active.value == '4') {
        listRef4.value.refreshEnd(list4.value.length>=total4.value);
      }
    }).finally(() => loading.value = false);
    if (active.value == '1') {
      list.value = res.records;
      total1.value = res.total;
      listRef1.value.refreshEnd(list.value.length>=res.total);
    } else if (active.value == '2') {
      list2.value = res.records;
      total2.value = res.total;
      listRef2.value.refreshEnd(list2.value.length>=res.total);
    } else if (active.value == '3') {
      list3.value = res.records;
      total3.value = res.total;
      listRef3.value.refreshEnd(list3.value.length>=res.total);
    } else if (active.value == '4') {
      list4.value = res.records;
      total4.value = res.total;
      listRef4.value.refreshEnd(list4.value.length>=res.total);
    }
  };

  const onLoad = async (params) => {
    const res = await getList(params).catch(() => {
      if (active.value == '1') {
        listRef1.value.loadEnd(list.value.length>=total1.value);
      } else if (active.value == '2') {
        listRef2.value.loadEnd(list2.value.length>=total2.value);
      } else if (active.value == '3') {
        listRef3.value.loadEnd(list3.value.length>=total3.value);
      } else if (active.value == '4') {
        listRef4.value.loadEnd(list4.value.length>=total4.value);
      }
    }).finally(() => loading.value = false);
    if (active.value == '1') {
      list.value = [...list.value, ...res.records];
      total1.value = res.total;
      listRef1.value.loadEnd(list.value.length>=res.total);
    } else if (active.value == '2') {
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      listRef2.value.loadEnd(list2.value.length>=res.total);
    } else if (active.value == '3') {
      list3.value = [...list3.value, ...res.records];
      total3.value = res.total;
      listRef3.value.loadEnd(list3.value.length>=res.total);
    } else if (active.value == '4') {
      list4.value = [...list4.value, ...res.records];
      total4.value = res.total;
      listRef4.value.loadEnd(list4.value.length>=res.total);
    }
  };

  watch(
    () => router,
    () => {
      active.value = activeIdx.value + '';
    },
    { immediate: true, deep: true }
  );

  onMounted(() => {
    // 首次加载列表
    // onLoad({});
  });

  const tabChange = (e) => {
    if (e == '1' && list.value.length == 0) {
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      onRefresh({});
    }
    if (e == '3' && list3.value.length == 0) {
      onRefresh({});
    }
    if (e == '4' && list4.value.length == 0) {
      onRefresh({});
    }
  };

  function getList(params?) {
    loading.value = true;
    return trainPageList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      status: active.value - 1,
      ...params,
    });
  }

  // 卡片跳转
  const openDetail = (item) => {
    let query = { id: item.taskId, source: 0 };
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/student/trainingTaskDetail', query: query });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    .tab-inner {
      height: calc(100vh - 44px);
      overflow-y: scroll;
      padding: 10px 15px;
    }

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
