<template>
  <div class="appCheckPlan">
    <!-- 基本信息区域 -->
    <div class="info-section">
      <div class="section-title">
        <span>基本信息</span>
      </div>
      <div class="info-content">
        <template v-for="item in infoList" :key="item.key">
          <div class="info-item">
            <div class="info-label">{{ item.label }}</div>
            <div class="info-value">{{ item.value }}</div>
          </div>
        </template>
      </div>
    </div>
    <!-- 检查项区域 -->
    <div class="check-section">
      <div class="section-title">
        <span>检查项</span>
      </div>
      <div class="check-items">
        <div v-for="(item, index) in checkItems" :key="index" class="check-item">
          <div class="check-item-header">
            <div class="check-number">{{ index + 1 }}</div>
            <div class="check-content">{{ item.content }}</div>
          </div>
          <div class="check-method">
            <span class="method-label">检查方式:</span>
            <span class="method-value">{{ item.way }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 底部按钮 -->
    <div class="bottom-actions">
      <a-button type="primary" @click="onExamine" class="examine-btn"> {{ route.query.type === 'view' ? '查看' : '开始检查' }} </a-button>
    </div>
  </div>
</template>

<script lang="ts" name="app-checkPlan-task" setup>
  import { ref, onMounted } from 'vue';
  import { recordDetail } from '../api';
  import { useRoute, useRouter } from 'vue-router';
  const route = useRoute();
  const router = useRouter();
  const infoList = ref<any[]>([
    { key: 'orgName', label: '所属单位', value: '' },
    { key: 'departName', label: '所属车间', value: '' },
    { key: 'code', label: '脱水器编号', value: '' },
    { key: 'taskTime', label: '任务时间', value: '' },
  ]);
  // 检查项数据
  const checkItems = ref<any[]>([]);
  onMounted(() => {
    if (route.query.id) {
      recordDetail({ id: route.query.id }).then((res) => {
        infoList.value.forEach((item) => {
          item.value = res[item.key] || '';
        });
        checkItems.value = res.itemList;
      });
    }
  });
  const onExamine = () => {
    router.push({
      path: '/app/dehydratorInspection/examine',
      query: {
        id: route.query.id,
        type: route.query.type,
      },
    });
  };
</script>

<style lang="less" scoped>
  .appCheckPlan {
    min-height: 100vh;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 16px;
    box-sizing: border-box;
    position: relative;

    // 通用样式
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }

    // 基本信息区域
    .info-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e8eaed;

      .info-content {
        .info-item {
          display: flex;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #f0f0f0;

          &:last-child {
            border-bottom: none;
          }

          .info-label {
            width: 100px;
            color: #666;
            font-size: 14px;
            font-weight: 500;
            flex-shrink: 0;
          }

          .info-value {
            flex: 1;
            color: #2c3e50;
            font-size: 14px;
            font-weight: 500;
            margin-left: 12px;
          }
        }
      }
    }

    // 检查项区域
    .check-section {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 100px; // 为底部按钮留出空间
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border: 1px solid #e8eaed;

      .check-items {
        .check-item {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 16px;
          border: 1px solid #e9ecef;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
            border-color: #1890ff;
          }

          &:last-child {
            margin-bottom: 0;
          }

          .check-item-header {
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;

            .check-number {
              width: 28px;
              height: 28px;
              background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
              color: white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 14px;
              font-weight: bold;
              margin-right: 16px;
              flex-shrink: 0;
              box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
            }

            .check-content {
              flex: 1;
              line-height: 1.6;
              color: #2c3e50;
              font-size: 15px;
              font-weight: 500;
            }
          }

          .check-method {
            margin-left: 44px;
            display: flex;
            align-items: center;

            .method-label {
              color: #666;
              font-size: 13px;
              margin-right: 8px;
            }

            .method-value {
              color: #1890ff;
              font-size: 13px;
              font-weight: 500;
              background: rgba(24, 144, 255, 0.1);
              padding: 4px 8px;
              border-radius: 4px;
            }
          }
        }
      }
    }

    // 底部按钮区域
    .bottom-actions {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 16px 20px;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
      border-top: 1px solid #e8eaed;
      z-index: 100;

      .examine-btn {
        width: 100%;
        height: 48px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
        border: none;
        box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(24, 144, 255, 0.4);
        }

        .btn-icon {
          margin-right: 8px;
          font-size: 16px;
        }
      }
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    .appCheckPlan {
      padding: 12px;

      .info-section,
      .check-section {
        padding: 16px;
        margin-bottom: 16px;
      }

      .check-section {
        margin-bottom: 80px;
      }

      .bottom-actions {
        padding: 12px 16px;

        .examine-btn {
          height: 44px;
          font-size: 15px;
        }
      }
    }
  }
</style>
