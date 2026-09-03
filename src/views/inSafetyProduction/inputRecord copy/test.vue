<template>
  <div class="test-page">
    <h2>投入台账功能测试</h2>
    
    <!-- 测试年度筛选 -->
    <div class="test-section">
      <h3>年度筛选测试</h3>
      <p>当前选择年度: {{ selectedYear }}</p>
      <a-select
        v-model:value="selectedYear"
        :options="yearOptions"
        placeholder="请选择年度"
        style="width: 200px"
        @change="handleYearChange"
      />
      <a-button type="primary" @click="handleQuery" style="margin-left: 16px">
        查询
      </a-button>
    </div>

    <!-- 测试数据展示 -->
    <div class="test-section">
      <h3>数据展示测试</h3>
      <p>当前数据条数: {{ recordList.length }}</p>
      <div v-for="record in recordList" :key="record.id" class="test-card">
        <p><strong>年度:</strong> {{ record.yearText }}</p>
        <p><strong>标题:</strong> {{ record.title }}</p>
        <p><strong>预算:</strong> {{ record.budgetText }}</p>
        <p><strong>状态:</strong> {{ record.statusText }}</p>
      </div>
    </div>

    <!-- 测试操作功能 -->
    <div class="test-section">
      <h3>操作功能测试</h3>
      <div v-for="record in recordList" :key="record.id" class="test-actions">
        <a-button @click="handleDownload(record)" size="small">下载</a-button>
        <a-button @click="handleUploadSignature(record)" size="small">上传签字版</a-button>
        <a-button @click="handleView(record)" size="small" type="primary">查看</a-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { useContent } from './hooks/useContent';

  const {
    loading,
    selectedYear,
    recordList,
    yearOptions,
    handleYearChange,
    handleQuery,
    handleDownload,
    handleUploadSignature,
    handleView
  } = useContent();
</script>

<style lang="less" scoped>
.test-page {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;

  h2 {
    color: #1890ff;
    margin-bottom: 24px;
  }

  .test-section {
    background: white;
    padding: 20px;
    margin-bottom: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    h3 {
      color: #333;
      margin-bottom: 16px;
    }

    p {
      margin-bottom: 8px;
    }
  }

  .test-card {
    background: #f5f5f5;
    padding: 16px;
    margin: 12px 0;
    border-radius: 6px;
    border-left: 4px solid #1890ff;

    p {
      margin: 4px 0;
    }
  }

  .test-actions {
    display: flex;
    gap: 12px;
    margin: 12px 0;
  }
}
</style>
