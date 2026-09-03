<template>
  <a-modal
    v-model:visible="visible"
    title="布控球详情"
    width="1400px"
    :footer="null"
    :body-style="{ padding: '24px', background: '#f0f2f5' }"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning" tip="加载中...">
      <div class="modal-content">
        <div v-for="(item, index) in businessUnits" :key="index" class="unit-card">
          <div class="unit-title">{{ item.orgName }}</div>
          <div class="ball-list">
            <div v-for="(ite, bIndex) in item.items" :key="bIndex" class="ball-item">
              <div class="ball-icon" :class="ite.state ? 'working' : 'pending'" @click="handleCamera(ite)">
                <Icon icon="ant-design:video-camera-filled" :size="18" color="#fff" />
              </div>
              <div class="ball-info">
                <span class="ball-name" @click="handleDetails(ite)">{{ ite.deviceName }}</span>
                <span v-if="ite.workState" class="ball-status" :class="ite.workState?.split(',')?.includes('3') ? 'working' : 'pending'">{{
                  ite.workState?.split(',')?.includes('3') ? '作业中' : '待作业'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <div class="modal-footer-custom">
      <a-button @click="handleCancel">取消</a-button>
    </div>
  </a-modal>
  <playerModal @register="registerPlayerModal" />
  <yhDetailsDrawer @register="registerYhDrawer" />
  <JobInfoModal v-model:visible="jobInfoVisible" :data="jobInfoList" @view-details="handleViewDetails" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import Icon from '/@/components/Icon';
  import { useModal } from '/@/components/Modal';
  import { useDrawer } from '/@/components/Drawer';
  import { message } from 'ant-design-vue';
  import playerModal from '/@/views/hazardousOperation/jobManagement/playedu-player/playerModal.vue';
  import { getUrl } from '/@/views/hazardousOperation/api/index';
  import yhDetailsDrawer from '/@/views/hazardousOperation/detail/detailDaver.vue';
  import JobInfoModal from './JobInfoModal.vue';
  import { getBkq, getBkqWork } from '../api';
  const visible = ref(false);
  const jobInfoVisible = ref(false);
  const jobInfoList: any = ref([]);
  const spinning = ref(false);
  const [registerPlayerModal, { openModal }] = useModal();
  const [registerYhDrawer, { openDrawer }] = useDrawer();
  const businessUnits: any = ref([]);
  const open = () => {
    visible.value = true;
    generateMockData();
  };

  const handleCancel = () => {
    visible.value = false;
  };

  const generateMockData = () => {
    spinning.value = true;
    getBkq()
      .then((res) => {
        if (res) {
          businessUnits.value = res;
        }
      })
      .finally(() => {
        spinning.value = false;
      });
  };
  const handleCamera = (data) => {
    if (!data.state) {
      return;
    }
    getUrl({
      code: data.deviceCode,
    })
      .then((res) => {
        if (res.code == 200) {
          openModal(true, {
            url: res.result,
            id: data.id,
            zIndex: 1001,
          });
        }
      })
      .catch(() => {
        message.error('网络超时！');
      });
  };
  const handleDetails = (data) => {
    jobInfoList.value = [];
    getBkqWork({
      deviceCode: data.deviceCode,
    }).then((res) => {
      if (res) {
        jobInfoList.value = res;
        jobInfoVisible.value = jobInfoList.value.length > 0;
        if (res.length === 0) {
          message.warning('暂无绑定作业！');
        }
      }
    });
  };

  const handleViewDetails = (item) => {
    openDrawer(true, {
      id: item.id,
    });
  };
  defineExpose({
    open,
  });
</script>

<style scoped lang="less">
  .modal-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    height: 650px;
    overflow-y: auto;
    padding: 4px;
  }
  :deep(.ant-spin) {
    max-height: 650px !important;
  }
  .unit-card {
    background: #fff;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
    border: 1px solid #f0f0f0;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-2px);
    }
  }

  .unit-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    border-left: 4px solid #1890ff;
    padding-left: 10px;
    line-height: 1.2;
  }

  .ball-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .ball-item {
    display: flex;
    align-items: center;
    padding: 4px 0;
  }

  .ball-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    flex-shrink: 0;
    cursor: pointer;
    &.working {
      background-color: #1890ff;
      box-shadow: 0 2px 6px rgba(24, 144, 255, 0.3);
    }

    &.pending {
      background-color: #d9d9d9;
    }
  }

  .ball-info {
    flex: 1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
  }

  .ball-name {
    color: #666;
    font-weight: 500;
    cursor: pointer;
  }

  .ball-status {
    font-size: 13px;

    &.working {
      color: #1890ff;
      font-weight: 500;
    }

    &.pending {
      color: #999;
    }
  }

  .modal-footer-custom {
    text-align: right;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e8e8e8;
    background: #fff; /* Ensure footer background matches modal if needed, or transparent */
    /* Since body style has background, we might want footer outside or styled differently.
       The a-modal footer is null, so this div is inside the body.
       Let's adjust styles to make it look like a footer or just float right.
    */
    position: sticky;
    bottom: -24px; /* Offset the body padding */
    margin-left: -24px;
    margin-right: -24px;
    margin-bottom: -24px;
    padding: 16px 24px;
  }
</style>
