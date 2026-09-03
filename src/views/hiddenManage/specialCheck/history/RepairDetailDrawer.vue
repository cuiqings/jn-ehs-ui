<template>
  <BasicDrawer v-bind="$attrs" @register="registerDrawer" title="整改计划" width="1000px" destroyOnClose>
    <div style="margin: 20px 0; text-align: right">
      <a-button type="primary" @click="exportPlanExcel">导出</a-button>
    </div>
    <a-table :columns="columns" :dataSource="itemList" :pagination="false" bordered>
      <template #yhLevel="{ record }">
        <span v-if="record.yhLevel == '1'">一般</span>
        <span v-if="record.yhLevel == '2'">重大</span>
      </template>
    </a-table>
    <!-- 审批记录 -->
    <div class="info-wrapper" style="margin: 20px 0">
      <div>
        <div class="info">
          <div class="split-line"></div>
          <div class="info-title">审批记录</div>
        </div>
        <div v-if="signList.length > 0">
          <div class="sign-wrap" v-for="(item, idx) in signList" :key="'c' + idx">
            <div style="font-weight: 500; color: #1890ff"> 安全科长（{{ item.orgName || '无' }}） </div>
            <div class="sign-item">
              <div class="sign-text">{{ item.signByName }}</div>
              <div class="sign-text">{{ item.signTime }}</div>
              <div class="sign-text"> <img :src="item.signPicture" alt="" style="width: 50px; height: 30px" /></div>
            </div>
            <div class="sign-option" v-if="item.approveLog.length > 0">
              <p>审批意见：</p>
              <a-table :columns="columnsLog" :data-source="item.approveLog" :pagination="false" />
            </div>
          </div>
        </div>
        <div style="margin: 20px auto" v-else>
          <a-empty description="暂无审批记录" />
        </div>
      </div>
    </div>
  </BasicDrawer>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { BasicDrawer, useDrawerInner } from '/src/components/Drawer';
  import { getRepairPlanAndApproveLog, exportExcel } from './history.api';
  import { downloadFileAll } from '/@/api/common/api';
  import dayjs from 'dayjs';
  const id = ref('');
  const historyData = ref({});
  const itemList = ref([]);
  const signList = ref([]);
  const columns: any = [
    {
      title: '序号',
      align: 'center',
      width: 80,
      customRender: ({ index }) => {
        return index + 1;
      },
    },
    { title: '检查时间', align: 'center', key: 'checkTime', dataIndex: 'checkTime' },
    { title: '责任单位', align: 'center', key: 'dutyOrgName', dataIndex: 'dutyOrgName' },
    { title: '责任车间', align: 'center', key: 'dutyDepartName', dataIndex: 'dutyDepartName' },
    { title: '隐患描述', align: 'center', key: 'yhDescription', dataIndex: 'yhDescription' },
    { title: '隐患等级', align: 'center', key: 'yhLevel', dataIndex: 'yhLevel', slots: { customRender: 'yhLevel' } },
    { title: '治理措施', align: 'center', key: 'handleMsr', dataIndex: 'handleMsr' },
    { title: '完成时限', align: 'center', key: 'repairTimeLimit', dataIndex: 'repairTimeLimit' },
    { title: '整改责任人', align: 'center', key: 'repairPersonName', dataIndex: 'repairPersonName' },
  ];
  const columnsLog = ref<any[]>([
    {
      title: '责任车间',
      dataIndex: 'dutyDepartName',
    },
    {
      title: '隐患描述',
      dataIndex: 'yhDescription',
    },
    {
      title: '意见',
      dataIndex: 'approveOpinion',
    },
  ]);
  const emit = defineEmits(['register', 'success']);
  const [registerDrawer, { setDrawerProps, closeDrawer }] = useDrawerInner(async (data) => {
    setDrawerProps({ confirmLoading: false });
    id.value = data.record.id;
    // 查详情by id
    let res = await getRepairPlanAndApproveLog({ id: data.record.id });
    console.log('getRepairPlanAndApproveLog', res);
    historyData.value = res;
    itemList.value = res.itemList;
    signList.value = res.signList;
  });
  const exportPlanExcel = () => {
    console.log('exportExcel');
    let params = {
      id: id.value,
    };
    const fileName = '整改计划' + dayjs(new Date()).format('YYYY年MM月DD日') + '.xlsx';
    downloadFileAll('/yh/skYhSpecialTask/exportRepairPlan', fileName, params);
  };
</script>
<style lang="less" scoped>
  .info-wrapper {
    padding: 0 12px;
  }
  .hi-wrapper {
    padding: 0 12px;
  }
  .info {
    display: flex;
    margin: 10px 0;

    .split-line {
      width: 4px;
      height: 20px;
      background: #3e87f8;
      margin-right: 10px;
      margin-top: 1px;
    }
    .info-title {
      font-size: 16px;
      font-family: SourceHanSansCN-Medium, SourceHanSansCN-Medium;
      font-weight: normal;
      color: rgba(0, 0, 0, 0.87);
    }
  }
  .org-name {
    font-size: 15px;
    font-family: SourceHanSansCN-Regular, SourceHanSansCN;
    font-weight: bold;
    color: rgba(0, 0, 0, 0.9);
    margin: 20px 0;
  }
  .info-content {
    display: flex;
    flex-direction: column;
    margin-top: 20px;
    .item {
      display: flex;
      margin-bottom: 15px;
      .item-title {
        width: 120px;
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.68);
        text-align: right;
      }
      .item-content {
        width: calc(100% - 120px);
        font-size: 14px;
        font-family: SourceHanSansCN-Regular, SourceHanSansCN;
        font-weight: normal;
        color: rgba(0, 0, 0, 0.9);
      }
    }
  }
  .sign-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    .sign-text {
      width: 20%;
      text-align: left;
      color: #333;
    }
  }
  .sign-wrap {
    padding: 16px;
    border-bottom: 1px solid #f5f5f5;
  }
  .sign-option {
    margin-left: 10px;
    p {
      font-weight: 500;
      color: #333;
    }
  }
</style>
