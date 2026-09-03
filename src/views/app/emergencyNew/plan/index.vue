<template>
  <div class="ledger">
    <List list-type="plan" :total="total" ref="listRef" @openDetail="openDetail" @onLoad="onLoad" @onRefresh="onRefresh" :list="list">
      <template #btn="{ item }">
        <van-button size="small" type="primary" @click.stop="go(item, 1)">去审核</van-button>
        <van-button size="small" type="primary" @click.stop="go(item, 2)">查看详情</van-button>
      </template>
    </List>
  </div>
</template>
<script setup lang="ts">
  import { examineList } from '/@/views/emergencyNew/api';
  import List from '../components/list.vue';
  import { useRouter } from 'vue-router';
  import { ref, nextTick } from 'vue';
  const listRef = ref<InstanceType<typeof List> | null>(null);
  const list = ref([]);
  const total = ref(0);
  const router = useRouter();
  const onLoad = async (params) => {
    await pageInit(params);
    nextTick(() => {
      listRef.value?.loadEnd();
    });
  };
  const onRefresh = async (params) => {
    await pageInit(params);
    nextTick(() => {
      listRef.value?.refreshEnd();
    });
  };
  const pageInit = async (params) => {
    const res = await examineList({ ...params, status: '2' });
    total.value = res.total;
    list.value = res.records;
  };

  const go = (item, type) => {
    if (type == 1) {
      router.push({
        path: '/app/emergencyNew/plandetail',
        query: {
          id: item.id,
          type: 'examine',
        },
      });
    } else {
      openDetail(item);
    }
  };

  const openDetail = (item) => {
    router.push({
      path: '/app/emergencyNew/plandetail',
      query: {
        id: item.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .ledger {
    width: 100%;
    height: 100%;
    padding: 10px 16px;
    overflow-y: auto;
    background-color: #ffffff;
  }
</style>
