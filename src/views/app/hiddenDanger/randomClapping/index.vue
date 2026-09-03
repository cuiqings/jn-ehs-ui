<template>
  <div class="hiddendanger">
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="待确认" name="1">
        <div class="tab-inner">
          <List
            :listType="1"
            :total="total1"
            ref="listRef1"
            :immediateCheck="false"
            @openDetail="openDetail"
            @edit="edit"
            :list="list"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="已确认" name="2">
        <div class="tab-inner">
          <List
            :listType="4"
            :total="total2"
            :needBtn="false"
            ref="listRef2"
            :immediateCheck="false"
            @openDetail="openDetail"
            @edit="edit"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
    </van-tabs>
    <div class="add-btn" @click="toAdd">
      <img src="../../../../assets/images/app/hazardous/input.png" alt="" class="add" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { ref, nextTick, onMounted, computed, watch } from 'vue';
  import { useRouter } from 'vue-router';
  import { jnYhSspList } from '../index.api';
  import List from '../components/list.vue';
  import { useAppStore } from '/@/store/modules/app';

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);

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
    const res = await getList(params).catch(() => {
      if (active.value == '1') {
        nextTick(() => {
          listRef1.value.refreshEnd();
        });
      } else {
        nextTick(() => {
          listRef2.value.refreshEnd();
        });
      }
    });
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
    const res = await getList(params).catch(() => {
      if (active.value == '1') {
        nextTick(() => {
          listRef1.value.loadEnd();
        });
      } else {
        nextTick(() => {
          listRef2.value.loadEnd();
        });
      }
    });
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

  watch(
    () => router,
    (n) => {
      active.value = activeIdx.value + '';
    },
    { immediate: true, deep: true }
  );

  onMounted(() => {
    // 首次加载列表
    onLoad({});
  });

  const tabChange = (e) => {
    if (e == '1' && list.value.length == 0) {
      onRefresh({});
    }
    if (e == '2' && list2.value.length == 0) {
      onRefresh({});
    }
  };

  function getList(params?) {
    return jnYhSspList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      type: active.value,
      ...params,
    });
  }

  // 按钮跳转
  const edit = (item) => {
    let query = { id: item.id, sourceType: 2 };
    if (item.confirm.hasOwnProperty('canHandle')) query.canHandle = item.canHandle;
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/hiddenDanger/randomClapping/edit', query: query });
  };

  const toAdd = () => {
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/hiddenDanger/randomClapping/add' });
  };

  // 卡片跳转
  const openDetail = (item) => {
    let query = { id: item.id, sourceType: 2 };
    if (item.confirm.hasOwnProperty('canHandle')) query.canHandle = item.confirm.canHandle;
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/hiddenDanger/randomClapping/detail', query: query });
  };
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
