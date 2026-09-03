<template>
  <div>
    <BasicModal
      v-bind="$attrs"
      @cancel="close"
      @close="close"
      @register="registerModal"
      :width="'80%'"
      :showOkBtn="false"
      :showCancelBtn="false"
      :bodyStyle="{ padding: '0px 20px 0 0' }"
      title="评分详情"
      :loading="loading"
      destroyOnClose
      :maskClosable="false"
    >
      <basic-table @register="registerTable" ref="tableRef">
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'taskStartTime'">
            <span :title="record.taskStartTime + '~' + record.taskEndTime">{{ record.taskStartTime + '~' + record.taskEndTime }}</span>
          </template>
        </template>
      </basic-table>
      <a-row>
        <a-col :span="24"> <div>培训课件</div></a-col>
        <a-col :span="24" v-for="item in scoreList.courseInfos" :key="item.resourceUrl"
          ><a-button type="link" @click="openResource(item.resourceUrl)">{{ item.resourceName }}</a-button></a-col
        >
        <a-col :span="12">
          <a-table :pagination="false" :dataSource="scoreList.scoreInfos" :columns="columns" />
        </a-col>
      </a-row>
    </BasicModal>
  </div>
</template>
<script lang="ts" name="evaluate-fun-modal" setup>
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useScoreContent } from './hooks/useScoreContent';
  import { BasicTable } from '/@/components/Table';
  import { lecturerScoreDetail } from './url/index';
  const loading = ref(false);
  const columns = [
    {
      title: '姓名',
      dataIndex: 'userName',
      width: 100,
    },
    {
      title: '评分',
      dataIndex: 'score',
      width: 100,
    },
  ];
  const scoreList = ref([]);
  const [registerModal, { closeModal }] = useModalInner(async (data) => {
    loading.value = true;
    pageInit(data);
    lecturerScoreDetail({
      id: data.id,
      userId: data.userId,
    }).then((res) => {
      loading.value = false;
      scoreList.value = res;
    });
  });

  const close = () => {
    closeModal();
  };

  const { pageInit, registerTable } = useScoreContent();
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
