<template>
  <div class="related-party-panel">
    <!-- 在厂项目统计 -->
    <div class="section-header">
      <div class="title">在厂项目统计</div>
      <div class="extra">
        <span>选择年份：</span>
        <a-date-picker 
          v-model:value="projectYear" 
          picker="year" 
          :allowClear="false" 
          @change="handleProjectYearChange"
          style="width: 120px" 
        />
      </div>
    </div>
    
    <!-- 项目统计卡片 -->
    <a-spin :spinning="loadingProjectSummary">
      <div class="card-container">
        <div class="stat-card blue">
          <div class="count">{{ projectSummary.sgzyz }}</div>
          <div class="label">施工作业中</div>
        </div>
        <div class="stat-card orange">
          <div class="count">{{ projectSummary.dzy }}</div>
          <div class="label">待作业</div>
        </div>
        <div class="stat-card green">
          <div class="count">{{ projectSummary.spz }}</div>
          <div class="label">审批中</div>
        </div>
        <div class="stat-card red">
          <div class="count">{{ projectSummary.yjs }}</div>
          <div class="label">已结束</div>
        </div>
      </div>
    </a-spin>

    <!-- 项目统计表格 -->
    <div class="table-container project-table">
      <a-table 
        :loading="loadingProjectList"
        :columns="projectColumns" 
        :data-source="projectList" 
        :pagination="false" 
        bordered
        size="small"
        rowKey="unit"
      >
        <template #bodyCell="{ column, record, text }">
           <template v-if="record.org === '统计'">
             <span style="font-weight: bold;">{{ text }}</span>
           </template>
           <template v-else-if="column.key === 'total'">
             <span style="color: #1890ff; font-weight: bold;">{{ record.total }}</span>
           </template>
        </template>
      </a-table>
    </div>

    <!-- 在厂人员统计 -->
    <div class="section-header" style="margin-top: 50px;">
      <div class="title">在厂人员统计</div>
    </div>

    <!-- 人员统计卡片 -->
    <a-spin :spinning="loadingPersonnelSummary">
      <div class="card-container">
        <div class="stat-card blue">
          <div class="count">{{ personnelSummary.count1 }}</div>
          <div class="label">在厂施工单位总数</div>
        </div>
        <div class="stat-card green">
          <div class="count">{{ personnelSummary.count2 }}</div>
          <div class="label">在厂人员总数</div>
        </div>
        <div class="stat-card purple">
          <div class="count">{{ personnelSummary.count3 }}</div>
          <div class="label">特种作业人数</div>
        </div>
        <div class="stat-card orange">
          <div class="count">{{ personnelSummary.count4 }}</div>
          <div class="label">即将到期人数</div>
        </div>
        <div class="stat-card red">
          <div class="count">{{ personnelSummary.count5 }}</div>
          <div class="label">到期人数</div>
        </div>
      </div>
    </a-spin>

    <!-- 人员统计表格 -->
    <div class="table-container personnel-table">
      <a-table 
        :loading="loadingPersonnelList"
        :columns="personnelColumns" 
        :data-source="personnelList" 
        :pagination="false" 
        bordered
        size="small"
        rowKey="unit"
      >
        <template #bodyCell="{ column, record }">
           <template v-if="column.key === 'count4'">
             <span style="color: #ff9d4d; font-weight: bold;">{{ record.count4 }}</span>
           </template>
           <template v-if="column.key === 'count5'">
             <span style="color: #f2637b; font-weight: bold;">{{ record.count5 }}</span>
           </template>
        </template>
        <template #summary>
          <a-table-summary-row style="background-color: #e6f7ff;">
            <a-table-summary-cell>统计</a-table-summary-cell>
            <a-table-summary-cell align="center">{{ personnelTotal.count1 }}</a-table-summary-cell>
            <a-table-summary-cell align="center">{{ personnelTotal.count2 }}</a-table-summary-cell>
            <a-table-summary-cell align="center">{{ personnelTotal.count3 }}</a-table-summary-cell>
            <a-table-summary-cell align="center">
              <span style="color: #ff9d4d; font-weight: bold;">{{ personnelTotal.count4 }}</span>
            </a-table-summary-cell>
            <a-table-summary-cell align="center">
              <span style="color: #f2637b; font-weight: bold;">{{ personnelTotal.count5 }}</span>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, onMounted } from 'vue';
  import type { Dayjs } from 'dayjs';
  import dayjs from 'dayjs';
  import { 
    getRelatedPartyProjectSummary, 
    getRelatedPartyProjectList, 
    getRelatedPartyPersonnelSummary, 
    getRelatedPartyPersonnelList 
  } from '../api';

  const projectYear = ref<Dayjs>(dayjs());
  const projectSummary = ref<any>({});
  const projectList = ref<any[]>([]);
  const personnelSummary = ref<any>({});
  const personnelList = ref<any[]>([]);

  // Loading states
  const loadingProjectSummary = ref(false);
  const loadingProjectList = ref(false);
  const loadingPersonnelSummary = ref(false);
  const loadingPersonnelList = ref(false);

  const projectColumns = [
    { title: '单位', dataIndex: 'org', key: 'org', width: 200 },
    { 
      title: '施工作业中', 
      children: [
        { title: '长期', dataIndex: 'sgzyz-cq', key: 'sgzyz-cq', align: 'center' },
        { title: '短期', dataIndex: 'sgzyz-dq', key: 'sgzyz-dq', align: 'center' },
      ]
    },
    { title: '待作业', dataIndex: 'dzy', key: 'dzy', align: 'center' },
    { title: '审批中', dataIndex: 'spz', key: 'spz', align: 'center' },
    { title: '已结束', dataIndex: 'yjs', key: 'yjs', align: 'center' },
    { title: '总计', dataIndex: 'total', key: 'total', align: 'center' },
  ];

  const personnelColumns = [
    { title: '单位', dataIndex: 'org', key: 'org', width: 200 },
    { title: '在厂施工单位数', dataIndex: 'count1', key: 'count1', align: 'center' },
    { title: '在厂人数', dataIndex: 'count2', key: 'count2', align: 'center' },
    { title: '特种作业人数', dataIndex: 'count3', key: 'count3', align: 'center' },
    { title: '即将到期人数', dataIndex: 'count4', key: 'count4', align: 'center' },
    { title: '到期人数', dataIndex: 'count5', key: 'count5', align: 'center' },
  ];

  // 计算人员统计总计行
  const personnelTotal = computed(() => {
    const total = { count1: 0, count2: 0, count3: 0, count4: 0, count5: 0 };
    personnelList.value.forEach(item => {
      total.count1 += item.count1;
      total.count2 += item.count2;
      total.count3 += item.count3;
      total.count4 += item.count4;
      total.count5 += item.count5;
    });
    return total;
  });

  // --- 业务逻辑 ---

  /**
   * 计算项目列表每一行的总计
   */
  const processProjectList = (list: any[]) => {
    if (!list) return [];
    return list.map(item => {
      const total = (Number(item['sgzyz-cq']) || 0) + 
                    (Number(item['sgzyz-dq']) || 0) + 
                    (Number(item['dzy']) || 0) + 
                    (Number(item['spz']) || 0) + 
                    (Number(item['yjs']) || 0);
      return { ...item, total };
    });
  };

  /**
   * 处理年份变化
   */
  const handleProjectYearChange = async () => {
    if (!projectYear.value) return;
    const year = projectYear.value.year();
    
    // 重新获取项目统计数据
    loadingProjectSummary.value = true;
    getRelatedPartyProjectSummary({ year })
      .then((res) => {
        projectSummary.value = res;
      })
      .finally(() => {
        loadingProjectSummary.value = false;
      });

    loadingProjectList.value = true;
    getRelatedPartyProjectList({ year })
      .then((res) => {
        projectList.value = processProjectList(res);
      })
      .finally(() => {
        loadingProjectList.value = false;
      });
  };

  /**
   * 初始化数据
   * @param dateRange 时间范围
   */
  const init = async (dateRange: [Dayjs, Dayjs]) => {
    console.log('RelatedPartyPanel init', dateRange);
    
    const year = projectYear.value.year();

    // Project Summary
    loadingProjectSummary.value = true;
    getRelatedPartyProjectSummary({ year })
      .then((res) => {
        projectSummary.value = res;
      })
      .finally(() => {
        loadingProjectSummary.value = false;
      });

    // Personnel Summary
    loadingPersonnelSummary.value = true;
    getRelatedPartyPersonnelSummary({})
      .then((res) => {
        personnelSummary.value = res;
      })
      .finally(() => {
        loadingPersonnelSummary.value = false;
      });

    // Personnel List
    loadingPersonnelList.value = true;
    getRelatedPartyPersonnelList({})
      .then((res) => {
        personnelList.value = res;
      })
      .finally(() => {
        loadingPersonnelList.value = false;
      });

    // Project List
    loadingProjectList.value = true;
    getRelatedPartyProjectList({ year })
      .then((res) => {
        projectList.value = processProjectList(res);
      })
      .finally(() => {
        loadingProjectList.value = false;
      });
  };

  defineExpose({
    init,
  });
</script>

<style scoped lang="less">
  .related-party-panel {
    padding: 10px;
    background: #fff;

    .section-header {
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .title {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        border-left: 4px solid #1890ff;
        padding-left: 8px;
      }

      .extra {
        display: flex;
        align-items: center;
        
        span {
          margin-right: 8px;
        }
      }
    }

    .card-container {
      display: flex;
      justify-content: space-between;
      margin-bottom: 50px;
      gap: 16px;

      .stat-card {
        flex: 1;
        padding: 20px;
        border-radius: 4px;
        color: #fff;
        text-align: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;

        .count {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 4px;
        }

        .label {
          font-size: 14px;
          opacity: 0.9;
        }

        &.blue { background-color: #3aa1ff; }
        &.orange { background-color: #ff9d4d; }
        &.green { background-color: #4ecb73; }
        &.red { background-color: #f2637b; }
        &.purple { background-color: #8d4eda; }
      }
    }

    .table-container {
      margin-bottom: 24px;
      
      :deep(.ant-table-summary) {
        // background-color: #fafafa; // 移除背景色，默认为白色或透明，符合截图
        font-weight: bold;
      }
      
      &.personnel-table,
      &.project-table {
        :deep(.ant-table-thead > tr > th) {
          background-color: #7262fd;
          color: #fff;
          font-weight: normal;
        }
      }
    }
  }
</style>