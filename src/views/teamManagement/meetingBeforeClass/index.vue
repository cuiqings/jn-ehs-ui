<template>
  <div>
    <basic-table @register="registerTable">
      <template #form-time="{ model, field }">
        <div style="display: flex; align-items: center; width: 100%">
          <a-range-picker v-model:value="model[field]" value-format="YYYY-MM-DD" style="width: 0; flex: 1" />
          <a-button size="small" style="margin-left: 4px; flex-shrink: 0" @click="onThisWeek(model, field)">本周</a-button>
        </div>
      </template>
      <template #tableTitle>
        <div v-if="showBoard" class="board-container">
          <div class="board-header">
            <span class="board-icon">📊</span>
            <span class="board-title">完成情况看板</span>
          </div>
          <template v-if="!boardNotWeek">
            <div class="board-content">
              <div class="board-item">
                <div class="board-item-icon" style="background: #e6f7ff">📋</div>
                <div class="board-item-content">
                  <div class="board-item-label">安全活动完成次数</div>
                  <div class="board-item-value">
                    <span class="value-main">{{ boardData.aqhdCount }}</span>
                    <span class="value-sep">/</span>
                    <span class="value-total">应完成 {{ boardData.aqhdCountBase }} 次</span>
                  </div>
                </div>
              </div>
              <div class="board-item">
                <div class="board-item-icon" style="background: #fff7e6">📅</div>
                <div class="board-item-content">
                  <div class="board-item-label">班组周例会完成次数</div>
                  <div class="board-item-value">
                    <span class="value-main">{{ boardData.zlhTeamCount }}</span>
                    <span class="value-sep">/</span>
                    <span class="value-total">应完成 {{ boardData.zlhTeamCountBase }} 次</span>
                  </div>
                </div>
              </div>
              <div class="board-item">
                <div class="board-item-icon" style="background: #f0e6ff">📍</div>
                <div class="board-item-content">
                  <div class="board-item-label">车间周例会完成次数</div>
                  <div class="board-item-value">
                    <span class="value-main">{{ boardData.zlhDeptCount }}</span>
                    <span class="value-sep">/</span>
                    <span class="value-total">应完成 {{ boardData.zlhDeptCountBase }} 次</span>
                  </div>
                </div>
              </div>
              <div class="board-item">
                <div class="board-item-icon" style="background: #e6fffb">📺</div>
                <div class="board-item-content">
                  <div class="board-item-label">安全视频完成次数</div>
                  <div class="board-item-value">
                    <span class="value-main">{{ boardData.aqspCount }}</span>
                    <span class="value-sep">/</span>
                    <span class="value-total">应完成 {{ boardData.aqspCountBase }} 次</span>
                  </div>
                </div>
              </div>
            </div>
          </template>
          <div v-else class="board-warning">
            ⚠ 当前时间范围不是「整周」(必须从某个周一开始到某个周日结束，可跨多周)，看板数据已隐藏。请点击「本周」按钮恢复默认范围，或调整为整周区间。
          </div>
        </div>
      </template>
      <template #action="{ record }">
        <table-action :actions="getActions(record)" />
      </template>
    </basic-table>
    <teamInfoDrawer @register="registerDrawer" @success="handleSuccess" />
  </div>
</template>
<script setup name="teamManagement-meetingBeforeClass" lang="ts">
  import { useContent } from './hooks/useContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import teamInfoDrawer from './drawer.vue';
  import dayjs from 'dayjs';
  const { registerTable, getActions, handleSuccess, registerDrawer, showBoard, boardNotWeek, boardData } = useContent();
  const onThisWeek = (model: any, field: string) => {
    const monday = dayjs().startOf('week').format('YYYY-MM-DD');
    const sunday = dayjs().endOf('week').format('YYYY-MM-DD');
    model[field] = [monday, sunday];
  };
</script>
<style lang="less" scoped>
.board-container {
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 10px 16px;
  width: 100%;
}

.board-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;

  .board-icon {
    font-size: 14px;
    margin-right: 6px;
  }

  .board-title {
    font-size: 14px;
    font-weight: 500;
    color: #1890ff;
  }
}

.board-content {
  display: flex;
  gap: 12px;
  width: 100%;
}

.board-item {
  flex: 1;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background: #fafafa;
  border-radius: 4px;

  .board-item-icon {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    font-size: 16px;
    margin-right: 10px;
    flex-shrink: 0;
  }

  .board-item-content {
    flex: 1;
  }

  .board-item-label {
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
  }

  .board-item-value {
    display: flex;
    align-items: baseline;

    .value-main {
      font-size: 20px;
      font-weight: 600;
      color: #1890ff;
      margin-right: 4px;
    }

    .value-sep {
      font-size: 13px;
      color: #999;
      margin-right: 4px;
    }

    .value-total {
      font-size: 12px;
      color: #666;
    }
  }
}
.board-warning {
  color: #fa8c16;
  font-size: 13px;
  padding: 8px 0;
  line-height: 1.6;
}
</style>
