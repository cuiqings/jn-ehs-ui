<!-- 共用列表 -->
<template>
  <van-pull-refresh v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
    <van-list :immediate-check="immediateCheck" v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <ListItem
        :btnText="props.btnText"
        :needBtn="props.needBtn"
        v-for="item in list"
        :item="item"
        :key="item"
        @itemClick="openDetail(item)"
        @btnClick="edit(item)"
      />
    </van-list>
  </van-pull-refresh>
</template>
<script lang="ts" setup>
  import { ref, toRef, watch } from 'vue';
  import ListItem from './listItem.vue';
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
  }>();

  const props = withDefaults(
    defineProps<{
      listType: number;
      list: any[];
      total: number;
      btnText?: string;
      needBtn?: boolean;
      needNotice?: boolean;
      isLast?: boolean;
      btnShowTag?: string;
      immediateCheck?: boolean;
    }>(),
    { needBtn: true, needNotice: false, listType: 1, btnShowTag: 'canHandle', immediateCheck: true }
  );

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
  const loadEnd = (s) => {
    loading.value = false;
    finished.value = s;
  };

  // 刷新状态结束
  const refreshEnd = (s) => {
    pageNo.value = 1;
    loading.value = false;
    refreshing.value = false;
    finished.value = s;
  };

  // item点击事件
  const openDetail = (item) => {
    emits('openDetail', item);
  };

  // 按钮点击事件
  const edit = (item) => {
    emits('edit', item);
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
  .hiddendanger {
    width: 100%;
    height: 100%;
    .tab-inner {
      height: calc(100vh - 44px);
      overflow-y: scroll;
      background: #eff1f5;
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
