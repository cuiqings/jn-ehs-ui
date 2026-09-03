<!-- 共用列表 -->
<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list :immediate-check="false" v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
        <ListItem2
          v-for="(item, idx) in list"
          :item="item"
          :isLast="props.isLast"
          :key="item"
          :showBatch="props.showBatch"
          :btnShowTag="props.btnShowTag"
          @checkChange="(val) => emits('checkChange', {...val, idx, id: item.id, checkType: item.checkType})"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
        />
    </van-list>
  </van-pull-refresh>
</template>
<script lang="ts" setup>
  import { ref, toRef } from 'vue';
  import ListItem2 from './listItem2.vue';
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);

  const emits = defineEmits<{
    (e: 'onRefresh', params: any): void;
    (e: 'onLoad', params: any): void;
    (e: 'openDetail', item: any): void;
    (e: 'edit', item: any): void;
    (e: 'checkChange', item: any);
  }>();

  const props = withDefaults(
    defineProps<{
      list: any[];
      total: number;
      btnText?: string;
      needBtn?: boolean;
      needNotice?: boolean;
      isLast?: boolean;
      btnShowTag?: string;
      showBatch?: boolean;
    }>(),
    { needBtn: true, needNotice: false, btnShowTag: 'canHandle' }
  );

  const list = toRef(props, 'list');
  const total = toRef(props, 'total');
    
  // 下拉刷新
  const onRefresh = () => {
    pageNo.value = 1;
    loading.value = true;
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
    refreshing.value = false;
    loading.value = false;
    pageNo.value = 1;
    if (list.value.length < total.value) {
      finished.value = false;
    }
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

  defineExpose({
    onRefresh,
    loadEnd,
    refreshEnd,
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
