<template>
  <a-modal
    v-model:visible="visible"
    :footer="null"
    :width="600"
    :body-style="{ padding: '0', background: 'transparent' }"
    :closable="false"
    centered
    wrapClassName="job-info-modal-wrap"
  >
    <div class="job-list-container">
      <div v-for="(item, index) in (data as any[])" :key="index" class="job-card">
        <div class="card-header">
          <span class="job-title">{{ item.workContent }}</span>
          <Icon icon="ant-design:close-outlined" class="close-icon" @click="handleClose" />
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label"># {{ item.workApplyCode }}</span>
            <div class="info-tag">
              <Icon icon="ant-design:tool-filled" :size="14" color="#999" />
              <span>{{ item.workType }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <Icon icon="ant-design:environment-filled" :size="14" color="#999" />
              <span>{{ item.workLocation }}</span>
            </div>
            <div class="info-item">
              <Icon icon="ant-design:bank-filled" :size="14" color="#999" />
              <span>{{ item.applicationUnit }}</span>
            </div>
          </div>
        </div>
        <div class="card-footer">
          <a class="detail-link" @click="handleViewDetails(item)">查看详情</a>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import Icon from '/@/components/Icon';

  const props = defineProps({
    visible: { type: Boolean, default: false },
    data: { type: Array, default: () => [] },
  });

  const emit = defineEmits(['update:visible', 'view-details']);

  const visible = computed({
    get: () => props.visible,
    set: (val) => emit('update:visible', val),
  });

  const handleClose = () => {
    visible.value = false;
  };

  const handleViewDetails = (item) => {
    emit('view-details', item);
  };
</script>

<style lang="less">
  .job-info-modal-wrap {
    .ant-modal-content {
      background: transparent;
      box-shadow: none;
    }
  }
</style>

<style scoped lang="less">
  .job-list-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 70vh;
    overflow-y: auto;
    padding: 10px;
  }

  .job-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    position: relative;
    transition: transform 0.2s;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }

  .job-title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
    line-height: 1.4;
  }

  .close-icon {
    font-size: 16px;
    color: #999;
    cursor: pointer;
    transition: color 0.3s;
    position: absolute;
    top: 16px;
    right: 16px;

    &:hover {
      color: #333;
    }
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .info-row {
    display: flex;
    align-items: center;
    gap: 24px;
    flex-wrap: wrap;
  }

  .info-label {
    color: #666;
    font-size: 14px;
  }

  .info-tag,
  .info-item {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #666;
    font-size: 14px;
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    border-top: 1px solid #f0f0f0;
    padding-top: 12px;
  }

  .detail-link {
    color: #1890ff;
    font-size: 14px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
</style>
