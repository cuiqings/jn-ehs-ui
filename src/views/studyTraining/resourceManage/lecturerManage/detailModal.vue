<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @cancel="close"
      @close="close"
      @register="registerModal"
      :width="'90%'"
      :showOkBtn="false"
      :showCancelBtn="false"
      defaultFullscreen
      :bodyStyle="{ padding: '0px 20px 0 0' }"
      title="讲师明细"
      destroyOnClose
      :maskClosable="false"
    >
      <basic-table @register="registerTable" ref="tableRef">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'taskStartTime'">
            <span :title="record.taskStartTime + '~' + record.taskEndTime">{{ record.taskStartTime + '~' + record.taskEndTime }}</span>
          </template>
        </template>

        <template #action="{ record }">
          <table-action :actions="getActions(record)" />
        </template>
      </basic-table>
    </BasicModal>
    <ScoreModal @register="registerScore" />
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useDetailContent } from './hooks/useDetailContent';
  import { BasicTable, TableAction } from '/@/components/Table';
  import ScoreModal from './scoreModal.vue';

  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    pageInit(data.data.userId);
  });

  const close = () => {
    closeModal();
  };

  const { pageInit, registerTable, getActions, registerScore } = useDetailContent();
</script>
<style lang="less" scoped>
  .statisc {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    .item {
      display: flex;
      flex-direction: column;
      text-align: center;
      color: #666;
      span {
        font-size: 22px;
        font-weight: 600;
        color: #333;
        padding-top: 15px;
      }
    }
  }
  .hd {
    display: flex;
    justify-content: space-between;
    .left {
    }
    .right {
    }
  }
  :deep(.ant-table-title) {
    height: 0 !important;
    min-height: 0 !important;
  }
</style>
