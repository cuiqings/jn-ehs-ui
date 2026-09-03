<template>
  <div class="personnel-certificate-panel">
    <!-- Top Statistics Cards -->
    <a-spin :spinning="loadingSummary">
      <div class="stats-cards">
        <div class="stat-card card-blue-gradient">
          <div class="count">{{ summaryData.zyfzrzs }}</div>
          <div class="label">主要负责人总数</div>
        </div>
        <div class="stat-card card-purple-gradient">
          <div class="count">{{ summaryData.gwaqglryzs }}</div>
          <div class="label">高危安全管理人员总数</div>
        </div>
        <div class="stat-card card-light-purple-gradient">
          <div class="count">{{ summaryData.fgwaqglryzs }}</div>
          <div class="label">非高危安全管理人员总数</div>
        </div>
        <div class="stat-card card-blue">
          <div class="count">{{ summaryData.tzzyryzs }}</div>
          <div class="label">特种作业人员总数</div>
        </div>
        <div class="stat-card card-indigo">
          <div class="count">{{ summaryData.zcaqgcszs }}</div>
          <div class="label">
            注册安全工程师总数
            <a-tooltip title="占主要负责人、安全管理人员（高危安全管理人员＋非高危安全管理人员）的比例">
              <InfoCircleOutlined style="margin-left: 5px; color: rgba(255, 255, 255, 0.8); cursor: pointer" />
            </a-tooltip>
            <span class="sub-label">占比: {{ summaryData.zcaqgcszb }}</span>
          </div>
        </div>
        <div class="stat-card card-orange">
          <div class="count">{{ summaryData.jjdq }}</div>
          <div class="label">即将到期数量</div>
        </div>
        <div class="stat-card card-red">
          <div class="count">{{ summaryData.cqws }}</div>
          <div class="label">超期未审数量</div>
        </div>
      </div>
    </a-spin>

    <!-- Section Title -->
    <div class="section-title"> <span class="bar">|</span> 各事业部资质证书统计 </div>

    <!-- Detailed Table -->
    <div class="table-container">
      <a-table :columns="columns" :data-source="tableData" :pagination="false" bordered size="middle" row-key="id" :loading="loadingTable">
        <template #headerCell="{ column }">
          <template v-if="column.key === 'zcaqgcszb'">
            <div style="display: flex; gap: 4px; align-items: center; justify-content: center">
              <span>占比</span>
              <a-tooltip title="占主要负责人、安全管理人员（高危安全管理人员＋非高危安全管理人员）的比例">
                <InfoCircleOutlined style="color: #1890ff; cursor: pointer" />
              </a-tooltip>
            </div>
          </template>
        </template>
      </a-table>
    </div>

    <!-- Safety Officer Summary Section -->
    <div class="section-title" style="margin-top: 20px">
      <span class="bar">|</span> 生产系统各事业部专职安全管理人员汇总表
      <div class="actions" style="margin-left: 10px; cursor: pointer">
        <EditOutlined v-auth="'dashboardHome:staffEdit'" v-if="!isSafetyEditing" @click="toggleSafetyEdit" style="color: #1890ff; font-size: 18px" />
        <div v-else>
          <a-button type="primary" size="small" @click="saveSafetyTable" style="margin-right: 5px"> 保存 </a-button>
          <a-button size="small" @click="cancelSafetyTable"> 取消 </a-button>
        </div>
      </div>
    </div>

    <div class="table-container">
      <a-table
        :columns="safetyTableColumns"
        :data-source="safetyTableData"
        :pagination="false"
        bordered
        size="middle"
        row-key="id"
        :loading="loadingSafety"
      >
        <template #bodyCell="{ column, record, text }">
          <template
            v-if="
              [
                'totalPerson',
                'deputyMinisterCount',
                'sectionChiefCount',
                'currentSafetyManagerCount',
                'totalSafetyStaff',
                'ratio',
                'requiredSafetyOfficerCount',
                'remarks',
              ].includes(column.dataIndex)
            "
          >
            <div v-if="isSafetyEditing">
              <a-input
                v-if="column.dataIndex === 'remarks' || column.dataIndex === 'ratio'"
                v-model:value="record[column.dataIndex]"
                style="margin: -5px 0"
              />
              <a-input-number :min="0" v-else v-model:value="record[column.dataIndex]" style="margin: -5px 0; width: 100%" />
            </div>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </template>
      </a-table>
      <div v-if="isSafetyEditing">
        <a-textarea v-model:value="safetyTableRemarks" style="margin-top: 10px" :rows="4" placeholder="请输入备注" :maxlength="1000" />
      </div>
      <div v-else class="remarks">
        {{ safetyTableRemarks }}
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, onMounted, h } from 'vue';
  import { EditOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
  import { getStaffCertifications1, getStaffCertifications2, getStaffCertifications3, setStaffCertifications3 } from '../api';
  import type { Dayjs } from 'dayjs';

  /**
   * Interface for Safety Officer Statistics Table
   */
  interface SafetyOfficerStats {
    id: string;
    displayId?: string;
    departmentName: string; // 单位
    subUnitName: string; // 单元
    totalPerson: number; // 单位总人数
    deputyMinisterCount: number; // 安全副部长数量
    sectionChiefCount: number; // 安全科长数量
    currentSafetyManagerCount: number; // 现有专职安全管理人员数量
    totalSafetyStaff: number; // 合计
    ratio: string; // 占全员比例
    requiredSafetyOfficerCount: number; // 应配备专职安全员数量
    remarks: string; // 备注
  }

  interface SummaryData {
    zyfzrzs?: number | string;
    gwaqglryzs?: number | string;
    fgwaqglryzs?: number | string;
    tzzyryzs?: number | string;
    zcaqgcszs?: number | string;
    zcaqgcszb?: number | string;
    jjdq?: number | string;
    cqws?: number | string;
  }

  const summaryData = ref<SummaryData>({});
  const loadingSummary = ref(false);

  const tableData = ref([]);
  const loadingTable = ref(false);

  // --- Safety Table State ---
  const loadingSafety = ref(false);
  const isSafetyEditing = ref(false);
  const safetyTableData = ref<SafetyOfficerStats[]>([]);
  const safetyTableRemarks = ref('');

  let originalSafetyTableData: SafetyOfficerStats[] = []; // Backup for cancel
  let originalSafetyTableRemarks = ''; // Backup for cancel

  const columns = [
    {
      title: '事业部',
      dataIndex: 'org',
      key: 'org',
      width: 140,
    },
    {
      title: '单位总人数',
      dataIndex: 'dwzrs',
      key: 'dwzrs',
      width: 80,
    },
    {
      title: '主要负责人总数',
      dataIndex: 'zyfzrzs',
      key: 'zyfzrzs',
      width: 80,
    },
    {
      title: '安全管理人员',
      children: [
        {
          title: '总数',
          children: [
            { title: '人数', dataIndex: 'aqglryzs', key: 'aqglryzs', width: 60 },
            { title: '占比', dataIndex: 'aqglryzb', key: 'aqglryzb', width: 80 },
          ],
        },
        {
          title: '高危安全管理人员',
          dataIndex: 'gwaqglryzs',
          key: 'gwaqglryzs',
          width: 80,
        },
        {
          title: '非高危安全管理人员',
          dataIndex: 'fgwaqglryzs',
          key: 'fgwaqglryzs',
          width: 90,
        },
      ],
    },
    {
      title: '特种作业人员',
      children: [
        { title: '总数', dataIndex: 'tzzyryzs', key: 'tzzyryzs', width: 60 },
        { title: '电工作业', dataIndex: 'dgzy', key: 'dgzy', width: 70 },
        { title: '焊接与热切割作业', dataIndex: 'hjyrqgzy', key: 'hjyrqgzy', width: 80 },
        { title: '冶金(有色)生产安全作业', dataIndex: 'yjysscaqzy', key: 'yjysscaqzy', width: 100 },
        { title: '高处作业', dataIndex: 'gczy', key: 'gczy', width: 70 },
        { title: '国家应急管理部门认定的其他作业', dataIndex: 'gjyjglbmrddqtzy', key: 'gjyjglbmrddqtzy', width: 130 },
      ],
    },
    {
      title: '注册安全工程师',
      children: [
        { title: '人数', dataIndex: 'zcaqgcsrs', key: 'zcaqgcsrs', width: 60 },
        { title: '占比', dataIndex: 'zcaqgcszb', key: 'zcaqgcszb', width: 80 },
      ],
    },
    {
      title: '即将到期数量',
      dataIndex: 'jjdqsl',
      key: 'jjdqsl',
      width: 80,
      customRender: ({ text }) => h('span', { style: { color: '#ff9800', fontWeight: 'bold' } }, text),
    },
    {
      title: '超期未审数量',
      dataIndex: 'cqwssl',
      key: 'cqwssl',
      width: 80,
      customRender: ({ text }) => h('span', { style: { color: '#f44336', fontWeight: 'bold' } }, text),
    },
  ];

  /**
   * Calculate Row Span for Safety Table
   */
  const getRowSpan = (record: SafetyOfficerStats, index: number, key: string) => {
    const data = safetyTableData.value;
    // safetyTableData 最后加一条合计，并且为之前的数据增加一个序号从1到12
    if (!data || data.length === 0) return { rowSpan: 1 };
    // Special handling for Total row if needed (id='18')
    if (record.departmentName === '合计') {
      // If we want '合计' to span first 3 columns
      if (key === 'displayId') return { colSpan: 3 };
      if (key === 'departmentName' || key === 'subUnitName') return { colSpan: 0 };
    }

    // Columns to merge by Department
    const mergeKeys = ['displayId', 'departmentName', 'deputyMinisterCount', 'totalSafetyStaff'];

    if (mergeKeys.includes(key) && record.departmentName !== '合计') {
      // Check if previous row has same departmentName
      if (index > 0 && data[index - 1].departmentName === record.departmentName) {
        return { rowSpan: 0 };
      } else {
        // Count how many rows have same departmentName
        let count = 1;
        for (let i = index + 1; i < data.length; i++) {
          if (data[i].departmentName === record.departmentName) {
            count++;
          } else {
            break;
          }
        }
        return { rowSpan: count };
      }
    }

    return { rowSpan: 1 };
  };

  const safetyTableColumns = [
    {
      title: '序号',
      dataIndex: 'displayId',
      key: 'displayId',
      width: 50,
      customCell: (record: SafetyOfficerStats, index: number) => getRowSpan(record, index, 'displayId'),
    },
    {
      title: '单位',
      dataIndex: 'departmentName',
      key: 'departmentName',
      width: 100,
      customCell: (record: SafetyOfficerStats, index: number) => getRowSpan(record, index, 'departmentName'),
    },
    {
      title: '单元',
      dataIndex: 'subUnitName',
      key: 'subUnitName',
      width: 80,
      customCell: (record: SafetyOfficerStats, index: number) => getRowSpan(record, index, 'subUnitName'),
    },
    {
      title: '单位总人数',
      dataIndex: 'totalPerson',
      key: 'totalPerson',
      width: 80,
    },
    {
      title: '安全副部长数量',
      dataIndex: 'deputyMinisterCount',
      key: 'deputyMinisterCount',
      width: 80,
      customCell: (record: SafetyOfficerStats, index: number) => getRowSpan(record, index, 'deputyMinisterCount'),
    },
    {
      title: '安全科长数量',
      dataIndex: 'sectionChiefCount',
      key: 'sectionChiefCount',
      width: 80,
    },
    {
      title: '现有专职安全管理人员数量',
      dataIndex: 'currentSafetyManagerCount',
      key: 'currentSafetyManagerCount',
      width: 100,
    },
    {
      title: '合计(只统计专职安管人员及安全科长，不包括安全副部长及部长)',
      dataIndex: 'totalSafetyStaff',
      key: 'totalSafetyStaff',
      width: 120,
      customCell: (record: SafetyOfficerStats, index: number) => getRowSpan(record, index, 'totalSafetyStaff'),
    },
    {
      title: '占全员比例',
      dataIndex: 'ratio',
      key: 'ratio',
      width: 80,
    },
    {
      title: '应配备专职安全员数量',
      dataIndex: 'requiredSafetyOfficerCount',
      key: 'requiredSafetyOfficerCount',
      width: 100,
    },
    {
      title: '备注',
      dataIndex: 'remarks',
      key: 'remarks',
      width: 150,
    },
  ];

  // --- Methods ---

  /**
   * Fetch summary statistics
   */
  const fetchSummaryData = async () => {
    loadingSummary.value = true;
    try {
      const res = await getStaffCertifications1();
      summaryData.value = res || {};
    } finally {
      loadingSummary.value = false;
    }
  };

  /**
   * Fetch table data
   */
  const fetchTableData = async () => {
    loadingTable.value = true;
    try {
      // Simulate API call
      const res = await getStaffCertifications2();
      tableData.value = res || [];
    } finally {
      loadingTable.value = false;
    }
  };

  /**
   * Fetch safety table data
   */
  const fetchSafetyData = async () => {
    loadingSafety.value = true;
    try {
      // Simulate API call
      const res = await getStaffCertifications3();
      safetyTableData.value = res.safetyTableData || [];
      let currentDisplayId = 0;
      let lastDepartment = '';

      safetyTableData.value = safetyTableData.value.map((item, index) => {
        if (item.departmentName !== '合计') {
          item.id = (index + 1).toString();
          if (item.departmentName !== lastDepartment) {
            currentDisplayId++;
            lastDepartment = item.departmentName;
          }
          item.displayId = currentDisplayId.toString();
        } else {
          item.id = '合计';
          item.displayId = '合计';
        }
        return item;
      });

      safetyTableRemarks.value = res.safetyTableRemarks || '';
    } finally {
      loadingSafety.value = false;
    }
  };

  /**
   * Toggle safety table edit mode
   */
  const toggleSafetyEdit = () => {
    if (!isSafetyEditing.value) {
      // Start editing - clone data
      originalSafetyTableData = JSON.parse(JSON.stringify(safetyTableData.value));
      originalSafetyTableRemarks = safetyTableRemarks.value;
      isSafetyEditing.value = true;
    }
  };

  /**
   * Save safety table data
   */
  const saveSafetyTable = async () => {
    // Simulate API call
    await setStaffCertifications3({
      safetyTableData: safetyTableData.value,
      safetyTableRemarks: safetyTableRemarks.value,
    });
    isSafetyEditing.value = false;
  };

  /**
   * Cancel safety table editing
   */
  const cancelSafetyTable = () => {
    safetyTableData.value = JSON.parse(JSON.stringify(originalSafetyTableData));
    safetyTableRemarks.value = originalSafetyTableRemarks;
    isSafetyEditing.value = false;
  };

  /**
   * Initialize component data
   */
  const init = async (range: [Dayjs, Dayjs]) => {
    console.log('PersonnelCertificatePanel init with range:', range);
    await Promise.all([fetchSummaryData(), fetchTableData(), fetchSafetyData()]);
  };

  defineExpose({
    init,
  });

  onMounted(() => {
    // Optional: Auto-load if range is available or just load defaults
    fetchSummaryData();
    fetchTableData();
    fetchSafetyData();
  });
</script>

<style lang="less" scoped>
  .personnel-certificate-panel {
    padding: 10px;
    background-color: #f0f2f5;

    .stats-cards {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .stat-card {
      flex: 1;
      min-width: 150px;
      height: 100px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

      .count {
        font-size: 32px;
        font-weight: bold;
        line-height: 1.2;
      }

      .label {
        font-size: 14px;
        margin-top: 5px;
        text-align: center;

        .sub-label {
          display: block;
          font-size: 12px;
          opacity: 0.9;
        }
      }
    }

    /* Gradient & Color Classes */
    .card-blue-gradient {
      background: linear-gradient(135deg, #6a82fb, #4b6cb7); // Blueish-purple gradient
    }
    .card-purple-gradient {
      background: linear-gradient(135deg, #8e2de2, #4a00e0); // Deep purple gradient
    }
    .card-light-purple-gradient {
      background: linear-gradient(135deg, #b06ab3, #4568dc); // Light purple/blue
    }
    .card-blue {
      background-color: #5c6bc0; // Solid Blue
    }
    .card-indigo {
      background-color: #7986cb; // Indigo
    }
    .card-orange {
      background-color: #ff9800; // Orange
    }
    .card-red {
      background-color: #f44336; // Red
    }

    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      display: flex;
      align-items: center;

      .bar {
        color: #1890ff;
        font-weight: bold;
        margin-right: 8px;
        font-size: 18px;
      }
    }

    .table-container {
      background-color: #fff;
      padding: 10px;
      border-radius: 8px;

      :deep(.ant-table-thead > tr > th) {
        background-color: #6a5acd; // Example header color matching the image style roughly
        color: #fff;
        text-align: center;
        border-right: 1px solid rgba(255, 255, 255, 0.2);
      }

      :deep(.ant-table-tbody > tr > td) {
        text-align: center;
      }

      // Highlight the total row if needed, or customize last row style
      :deep(.ant-table-tbody > tr:last-child) {
        background-color: #e6f7ff;
        font-weight: bold;
      }
    }
  }
  .remarks {
    margin: 20px 0;
    font-size: 15px;
    line-height: 1.5;
  }
</style>
