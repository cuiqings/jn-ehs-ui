<template>
  <div class="hiddendanger">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="未完成" name="1">
        <div class="tab-inner">
          <List
            :listType="3"
            :total="total1"
            ref="listRef1"
            @openDetail="openDetail"
            @edit="edit"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="已完成" name="2">
        <div class="tab-inner">
          <List
            :listType="31"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            @openDetail="openDetail"
            @edit="edit"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
    </van-tabs>
  </div>
</template>
<script lang="ts" setup>
  import { ref, nextTick } from 'vue';
  import { useRouter } from 'vue-router';
  import { statistics6, statistics5 } from '../index.api';
  import List from '../components/list.vue';

  const props = defineProps({
    queryParams: {
      type: Object,
      default: () => {},
    },
  });
  const router = useRouter();
  const list = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const loading = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef1 = ref();
  const listRef2 = ref();
  const total1 = ref(0);
  const total2 = ref(0);

  const onRefresh = async (params) => {
    const res = await getList(params);
    if (active.value == '1') {
      list.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    } else {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    }
  };

  const onLoad = async (params) => {
    const res = await getList(params);
    loading.value = false;
    if (active.value == '1') {
      list.value = [...list.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else {
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    }
  };

  // 首次加载列表
  onLoad({ pageNo: pageNo.value, pageSize: pageSize.value });

  const tabChange = (e) => {
    if (e == '1' && list.value.length == 0) {
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      onRefresh({});
    }
  };

  function getList(params?) {
    if (active.value == '1') {
      return statistics5({ ...props.queryParams, ...params });
    } else {
      return statistics6({ ...props.queryParams, ...params });
    }
  }

  // 按钮跳转
  const edit = (item) => {
    router.push({ path: '/app/hiddenDanger/randomClapping/edit', query: { id: item.id, sourceType: 2 } });
  };

  // 卡片跳转
  const openDetail = (item) => {
    router.push({ path: '/app/hiddenDanger/randomClapping/detail', query: { id: item.id, sourceType: 2 } });
  };

  defineExpose({
    onRefresh,
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
