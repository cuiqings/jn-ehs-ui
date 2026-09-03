<template>
  <div class="input-record-page">
    <!-- 顶部控制栏 -->
    <div class="control-bar">
      <div class="year-filter">
        <span class="label">年度</span>
        <a-select
          v-model:value="selectedYear"
          :options="yearOptions"
          placeholder="请选择年度"
          style="width: 120px"
          @change="handleYearChange"
        />
        <a-button type="primary" @click="handleQuery" :loading="loading">
          查询
        </a-button>
      </div>
    </div>

    <!-- 预算卡片区域 -->
    <div class="budget-cards" v-loading="loading">
      <div
        v-for="record in recordList"
        :key="record.id"
        class="budget-card"
      >
        <!-- 年度标签 -->
        <div class="year-tag">
          <a-tag color="blue" size="large">{{ record.yearText }}</a-tag>
        </div>

        <!-- 标题 -->
        <div class="card-title">
          {{ record.title }}
        </div>

        <!-- 预算金额 -->
        <div class="budget-amount">
          <span class="amount-text">{{ record.budgetText }}</span>
          <a-tag :color="record.statusColor" class="status-tag">
            {{ record.statusText }}
          </a-tag>
        </div>

        <!-- 操作按钮 -->
        <div class="card-actions">
          <a-button 
            type="default" 
            size="small" 
            @click="handleDownload(record)"
            class="action-btn download-btn"
          >
            下载
          </a-button>
          <a-button 
            type="default" 
            size="small" 
            @click="handleUploadSignature(record)"
            class="action-btn upload-btn"
          >
            上传签字版
          </a-button>
          <a-button 
            type="primary" 
            size="small" 
            @click="handleView(record)"
            class="action-btn view-btn"
          >
            查看
          </a-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && recordList.length === 0" class="empty-state">
      <a-empty description="暂无数据" />
    </div>
  </div>
</template>

<script lang="ts" name="input-record" setup>
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
.input-record-page {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;

  .control-bar {
    background: white;
    padding: 20px 24px;
    border-radius: 8px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .year-filter {
      display: flex;
      align-items: center;
      gap: 12px;

      .label {
        font-size: 14px;
        color: #333;
        font-weight: 500;
      }
    }
  }

  .budget-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 24px;
    margin-bottom: 24px;

    .budget-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      position: relative;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      }

      .year-tag {
        margin-bottom: 16px;
        text-align: center;

        :deep(.ant-tag) {
          font-size: 14px;
          padding: 4px 12px;
          border-radius: 20px;
        }
      }

      .card-title {
        font-size: 16px;
        color: #333;
        font-weight: 500;
        text-align: center;
        margin-bottom: 20px;
        line-height: 1.4;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .budget-amount {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 24px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;

        .amount-text {
          font-size: 24px;
          font-weight: 600;
          color: #1890ff;
        }

        .status-tag {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 4px;
        }
      }

      .card-actions {
        display: flex;
        gap: 12px;
        justify-content: center;

        .action-btn {
          flex: 1;
          height: 32px;
          border-radius: 6px;
          font-size: 12px;

          &.download-btn {
            border-color: #52c41a;
            color: #52c41a;

            &:hover {
              background: #f6ffed;
              border-color: #73d13d;
            }
          }

          &.upload-btn {
            border-color: #faad14;
            color: #faad14;

            &:hover {
              background: #fffbe6;
              border-color: #ffc53d;
            }
          }

          &.view-btn {
            background: #1890ff;
            border-color: #1890ff;
            color: white;

            &:hover {
              background: #40a9ff;
              border-color: #40a9ff;
            }
          }
        }
      }
    }
  }

  .empty-state {
    text-align: center;
    padding: 60px 0;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .input-record-page {
    padding: 16px;

    .budget-cards {
      grid-template-columns: 1fr;
      gap: 16px;

      .budget-card {
        padding: 20px;

        .card-title {
          font-size: 14px;
          min-height: 40px;
        }

        .budget-amount {
          .amount-text {
            font-size: 20px;
          }
        }

        .card-actions {
          flex-direction: column;
          gap: 8px;

          .action-btn {
            width: 100%;
          }
        }
      }
    }
  }
}
</style>
