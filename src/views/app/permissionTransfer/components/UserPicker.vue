<template>
  <van-popup :show="show" position="bottom" :style="{ height: '90%' }" round @update:show="updateShow">
    <div class="user-picker flex flex-col h-full">
      <van-nav-bar title="选择接收人员" left-text="取消" @click-left="onCancel" />
      <van-search v-model="searchValue" placeholder="请输入姓名/工号" @update:model-value="onSearchInput" @clear="onSearchInput" />
      <div class="flex-1 overflow-y-auto">
        <van-list v-model:loading="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
          <van-cell v-for="item in list" :key="item.id" clickable @click="onSelect(item)">
            <template #title>
              <span class="text-base font-bold" v-html="highlight(item.realname)"></span>
            </template>
            <template #label>
              <div class="text-gray-500">
                工号：<span v-html="highlight(item.workNo || item.username)"></span> | 部门：{{ item.departName || item.orgCodeTxt || item.org3Name || '-' }}
              </div>
            </template>
            <template #right-icon>
              <van-radio :name="item.id" :model-value="selectedId" />
            </template>
          </van-cell>
          <div v-if="list.length === 0 && finished" class="empty-tip">未找到匹配人员</div>
        </van-list>
      </div>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { getReceiverList } from '../api';

  const props = defineProps<{ show: boolean }>();
  const emit = defineEmits(['update:show', 'select']);

  const searchValue = ref('');
  const loading = ref(false);
  const finished = ref(false);
  const list = ref<any[]>([]);
  const pageNo = ref(1);
  const pageSize = 20;
  const selectedId = ref('');
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  // 高亮匹配关键词
  const highlight = (text: string) => {
    const kw = searchValue.value.trim();
    if (!kw || !text) return text;
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return text.replace(new RegExp(`(${escaped})`, 'gi'), '<mark>$1</mark>');
  };

  const updateShow = (val: boolean) => emit('update:show', val);
  const onCancel = () => updateShow(false);

  const onSelect = (item: any) => {
    selectedId.value = item.id;
    emit('select', item);
    updateShow(false);
  };

  // 重置并重新加载
  const reset = () => {
    pageNo.value = 1;
    list.value = [];
    finished.value = false;
    onLoad();
  };

  // 输入时防抖 300ms 后触发搜索
  const onSearchInput = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      reset();
    }, 300);
  };

  const onLoad = async () => {
    loading.value = true;
    try {
      const res = await getReceiverList({
        pageNo: pageNo.value,
        pageSize,
        searchValue: searchValue.value,
      });
      const records = res?.records || [];

      if (pageNo.value === 1) {
        list.value = records;
      } else {
        list.value = [...list.value, ...records];
      }

      if (records.length < pageSize) {
        finished.value = true;
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
        reset();
      }
      if (!val) {
        searchValue.value = '';
      }
    }
  );
</script>

<style scoped>
  .user-picker {
    background-color: #f7f8fa;
  }

  .empty-tip {
    text-align: center;
    color: #969799;
    font-size: 14px;
    padding: 40px 0;
  }

  :deep(mark) {
    background-color: #fff3cd;
    color: #ee0a24;
    padding: 0;
    font-weight: 600;
  }
</style>
