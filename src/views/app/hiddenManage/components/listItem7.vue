<!-- 隐患列表项 -->
<template>
  <div class="item" @click="openDetail">
    <div class="right">
      <!-- 头部：描述 + 状态 -->
      <div class="item-header">
        <div class="content title">
          {{ curItem.yhDescription }}
        </div>
        <span class="status-tag" :class="getStatusClass(curItem.status)">
          {{ getStatusText(curItem.status) }}
        </span>
      </div>
      
      <!-- 隐患地点 -->
      <p class="info-row">
        <span>隐患地点：</span>
        <span>{{ curItem.yhPlace || '--' }}</span>
      </p>

      <!-- 举报层级 -->
      <p class="info-row">
        <span>举报层级：</span>
        <span>{{ curItem.reportLevel === '1' ? '安全部' : (curItem.reportLevel === '2' ? '厂部' : '--') }}</span>
      </p>

      <!-- 归属单位 -->
      <p class="info-row">
        <span>归属单位：</span>
        <span>{{ curItem.orgName || '--' }}</span>
      </p>

      <!-- 发现时间 -->
      <p class="info-row">
        <span>发现时间：</span>
        <span>{{ curItem.findTime || '--' }}</span>
      </p>

      <!-- 操作按钮 -->
      <div class="btn">
        <van-button type="primary" @click.stop="openDetail">查看</van-button>
        <van-button style="margin-left: 5px" type="danger" @click.stop="deleteItem">删除</van-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';

const props = withDefaults(
  defineProps<{
    btnText?: string;
    item: any;
  }>(),
  {
    btnText: '处理',
    item: () => ({}),
  }
);

const curItem = computed(() => props.item);
const emit = defineEmits(['itemClick', 'btnClick', 'editItem', 'deleteItem']);

// 状态映射
const getStatusText = (status) => {
  // 状态（1待答复 2已关闭 3待奖励 4已奖励）
  const statusMap = {
    '1': '待答复',
    '2': '已关闭',
    '3': '待奖励',
    '4': '已奖励',
  };
  return statusMap[status] || '未知状态';
};

const getStatusClass = (status) => {
  const classMap = {
    '1': 'status-orange',
    '2': 'status-red',
    '3': 'status-blue',
    '4': 'status-green',
  };
  return classMap[status] || 'status-default';
};

// 按钮事件
const edit = () => {
  emit('btnClick');
};

const editItem = () => {
  emit('editItem');
};

const deleteItem = () => {
  emit('deleteItem');
};

const openDetail = () => {
  emit('itemClick');
};
</script>

<style scoped lang="less">
.item {
  display: flex;
  padding: 10px;
  background: #fff;
  border-bottom: 1px solid #f5f5f5;
  
  .right {
    flex: 1;
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;

      .title {
        font-size: 14px;
        font-weight: bold;
        flex: 1;
        margin-right: 10px;
        word-break: break-all;
      }

      .status-tag {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 12px;
        flex-shrink: 0;
        
        &.status-orange {
          color: orange;
          background: #fffbe6;
          border: 1px solid #ffa39e;
        }
        
        &.status-blue {
          color: #1890ff;
          background: #e6f7ff;
          border: 1px solid #91d5ff;
        }
        
        &.status-green {
          color: #52c41a;
          background: #f6ffed;
          border: 1px solid #b7eb8f;
        }
        
        &.status-red {
          color: #ff4d4f;
          background: #fff1f0;
          border: 1px solid #ffa39e;
        }
        
        &.status-info {
          color: #909399;
          background: #f4f4f5;
          border: 1px solid #e9e9eb;
        }

        &.status-default {
          color: #666;
          background: #f5f5f5;
          border: 1px solid #dcdfe6;
        }
      }
    }
    
    .info-row {
      font-size: 12px;
      color: #666;
      margin: 4px 0;
      display: flex;
      
      span:first-child {
        color: #999;
        width: 70px;
        flex-shrink: 0;
      }
    }

    .btn {
      margin-top: 10px;
      text-align: right;
    }
  }
}
</style>
