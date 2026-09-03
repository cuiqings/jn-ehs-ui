<!-- 共用列表 -->
<template>
  <van-pull-refresh v-model="refreshing" ref="pullRefresh" @refresh="onRefresh">
    <van-list :immediate-check="immediateCheck" v-model:loading="loading" :finished="finished" :finished-text="finishedText" @load="onLoad">
      <template v-if="listType==1">
        <ListItem
          :btnText="props.btnText"
          :needBtn="props.needBtn"
          v-for="item in list"
          :item="item"
          :key="item"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
          @exchange="exchange(item)"
        />
      </template>
      <template v-if="listType==2">
        <ListItem2
          :btnText="props.btnText"
          :needBtn="props.needBtn"
          :needNotice="props.needNotice"
          v-for="item in list"
          :item="item"
          :isLast="props.isLast"
          :key="item"
          :btnShowTag="props.btnShowTag"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
        />
      </template>
      <template v-if="listType==3">
        <ListItem3
          :btnText="props.btnText"
          :needBtn="props.needBtn"
          v-for="item in list"
          :item="item"
          :key="item"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
        />
      </template>
      <template v-if="listType==31">
        <ListItem31
          :btnText="props.btnText"
          :needBtn="props.needBtn"
          v-for="item in list"
          :item="item"
          :key="item"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
        />
      </template>
      <template v-if="listType==4">
        <ListItem4
          :btnText="props.btnText"
          :needBtn="props.needBtn"
          v-for="item in list"
          :item="item"
          :key="item"
          @itemClick="openDetail(item)"
          @btnClick="edit(item)"
        />
      </template>
    </van-list>
  </van-pull-refresh>
</template>
<script lang="ts" setup>
  import { watch, ref, toRef, computed } from 'vue';
  import ListItem from './listItem.vue';
  import ListItem2 from './listItem2.vue';
  import ListItem3 from './listItem3.vue';
  import ListItem31 from './listItem31.vue';
  import ListItem4 from './listItem4.vue';
  const finishedText = computed(() => {
    return list.value.length == 0 ? '暂无数据' : '没有更多了';
  });
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(1);
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

  const list = toRef(props, 'list');
  const total = toRef(props, 'total');

  // watch(
  //   () => props.total,
  //   (n) => {
  //     if(n != props.list.length){
  //       finished.value = false;
  //     }
  //   }
  // )
    
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
