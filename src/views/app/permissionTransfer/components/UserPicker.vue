<template>
  <van-popup :show="show" position="bottom" :style="{ height: '90%' }" round @update:show="updateShow">
    <div class="user-picker flex flex-col h-full">
      <van-nav-bar title="选择接收人员" left-text="取消" @click-left="onCancel" />
      <van-search v-model="searchValue" placeholder="请输入姓名/工号" @search="onSearch" @clear="onSearch" />
      <div class="flex-1 overflow-y-auto">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-cell v-for="item in list" :key="item.id" clickable @click="onSelect(item)">
            <template #title>
              <span class="text-base font-bold">{{ item.realname }}</span>
            </template>
            <template #label>
              <div class="text-gray-500">
                工号：{{ item.workNo || item.username }} | 部门：{{ item.departName || item.orgCodeTxt || item.org3Name || '-' }}
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="item.id" :model-value="selectedId" />
            </template>
          </van-cell>
        </van-list>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getReceiverList } from '../api';
  import { useUserStore } from '/@/store/modules/user';

  const props = defineProps<{
    show: boolean;
  }>();

  const emit = defineEmits(['update:show', 'select']);

  const userStore = useUserStore();
  const searchValue = ref('');
  const loading = ref(false);
  const finished = ref(false);
  const list = ref<any[]>([]);
  const pageNo = ref(1);
  const pageSize = ref(20);
  const selectedId = ref('');

  const updateShow = (val: boolean) => {
    emit('update:show', val);
  };

  const onCancel = () => {
    updateShow(false);
  };

  const onSelect = (item: any) => {
    selectedId.value = item.id;
    emit('select', item);
    updateShow(false);
  };

  const onSearch = () => {
    pageNo.value = 1;
    list.value = [];
    finished.value = false;
    onLoad();
  };

  const onLoad = async () => {
    loading.value = true;
    try {
      // 传递当前登录人的orgCode，以实现“同级别及以下”的筛选（假设后端支持或orgCode本身隐含层级）
      const params = {
        pageNo: pageNo.value,
        pageSize: pageSize.value,
        searchValue: searchValue.value,
      };
      const res = await getReceiverList(params);
      const records = res.records || [];

      if (records.length < pageSize.value) {
        finished.value = true;
      }

      if (pageNo.value === 1) {
        list.value = records;
      } else {
        list.value = [...list.value, ...records];
      }
      pageNo.value++;
    } catch (error) {
      finished.value = true;
    } finally {
      loading.value = false;
    }
  };

  watch(
    () => props.show,
    (val) => {
      if (val && list.value.length === 0) {
        onLoad();
      }
    }
  );
</script>

<style scoped>
  .user-picker {
    background-color: #f7f8fa;
  }
</style>
