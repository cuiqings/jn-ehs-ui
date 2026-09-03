<!-- 共用列表 -->
<template>
  <van-pull-refresh style="min-height: 100vh;" v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
    <van-list :immediate-check="immediateCheck" v-model:loading="loading" :finished="finished" :finished-text="finishedText" @load="onLoad">
      <ListItem 
        v-if="listType=='ledger'"
        v-for="item in list"
        @click="openDetail(item)"
        :item="item" />
      <MaterialList
        v-if="listType=='material'"
        v-for="item in list"
        @click="openDetail(item)"
        :isChecked="isChecked"
        :item="item"  />
      <PlanItem 
        v-if="listType=='plan'"
        v-for="item in list"
        @click="openDetail(item)"
        :item="item">
        <template #btn>
          <slot name="btn" :item="item"></slot>
        </template>
        </PlanItem>
      <TaskItem 
        v-if="listType=='task'"
        v-for="item in list"
        @click="openDetail(item)"
        :item="item">
        <template #btn>
          <slot name="btn" :item="item"></slot>
        </template>
        </TaskItem>
    </van-list>
  </van-pull-refresh>
</template>
<script lang="ts" setup>
  import { watch, ref, toRef, computed } from 'vue';
  import MaterialList from './materialItem.vue'
  import PlanItem from './planItem.vue'
  import ListItem from './listItem.vue'
  import TaskItem from './taskItem.vue'
  const finishedText = computed(() => {
    return list.value.length == 0 ? '暂无数据' : '没有更多了';
  });
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(0);
  const pageSize = ref(10);
  const pullRefresh = ref();

  const emits = defineEmits<{
    (e: 'onRefresh', params: any): void;
    (e: 'onLoad', params: any): void;
    (e: 'openDetail', item: any): void;
    (e: 'edit', item: any): void;
    (e: 'exchange', item: any): void;
  }>();

  const props = withDefaults(
    defineProps<{
      listType: string;
      list: any[];
      total: number;
      btnText?: string;
      needBtn?: boolean;
      needNotice?: boolean;
      isLast?: boolean;
      btnShowTag?: string;
      immediateCheck?: boolean;
      isChecked?: boolean;
    }>(),
    { needBtn: true, needNotice: false, listType: 'ledger', btnShowTag: 'canHandle', immediateCheck: true, isChecked: false }
  );

  const list = toRef(props, 'list');
  const total = toRef(props, 'total');
    
  // 下拉刷新
  const onRefresh = () => {
    loading.value = true;
    pageNo.value = 1;
    emits('onRefresh', { pageNo: pageNo.value, pageSize: pageSize.value });
  };

  // 上拉加载
  const onLoad = () => {
    loading.value = true;
    pageNo.value += 1;
    emits('onLoad', { pageNo: pageNo.value, pageSize: pageSize.value });
  };

  // 加载状态结束
  const loadEnd = () => {
    loading.value = false;
    if (list.value.length >= total.value) {
      finished.value = true;
    }
  };

  // 刷新状态结束
  const refreshEnd = () => {
    loading.value = false;
    refreshing.value = false;
    finished.value = false;
    if (list.value.length >= total.value) {
      finished.value = true;
    }
  };

  // item点击事件
  const openDetail = (item) => {
    emits('openDetail', item);
  };

  // 按钮点击事件
  const edit = (item) => {
    emits('edit', item);
  };

  const exchange = (item) => {
    emits('exchange', item);
  };

  const refreshFn = () => {
    pullRefresh.value.refresh();
  }
  defineExpose({
    loadEnd,
    refreshEnd,
    refreshFn
  });
</script>

<style lang="less" scoped>
</style>
