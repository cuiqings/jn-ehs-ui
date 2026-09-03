<template>
  <a-modal title="查看日志" :width="700" :body-style="{ padding: '20px' }" v-model:visible="logVisible" :footer="false">
    <div>
      <a-table :columns="columns" :data-source="dataSource" :scroll="{ y: 550 }" :pagination="false" :loading="loading" />
      <Pagination class="log-pagination" size="small" :total="pagination.total" show-size-changer show-quick-jumper @change="pageChange" />
      <div class="spin-bottom">
        <a-button @click="handleCancel">关闭</a-button>
      </div>
    </div>
  </a-modal>
</template>
<script setup name="file-model" lang="ts">
  import { Pagination } from 'ant-design-vue';
  import { useLog } from './hooks/useLog';
  const { logVisible, handleCancel, columns, dataSource, loading, openLop, pageChange, pagination } = useLog();
  defineExpose(openLop);
</script>
<style lang="less" scoped>
  .log-pagination {
    padding: 20px;
    text-align: right;
    border-bottom: 1px solid #f0f0f0;
  }
  .spin-bottom {
    text-align: center;
    margin-top: 15px;
  }
</style>
