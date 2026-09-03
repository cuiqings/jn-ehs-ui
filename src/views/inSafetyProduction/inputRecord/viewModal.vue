<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="modalTitle"
    :width="1200"
    :min-height="600"
    :show-cancel-btn="false"
    :show-ok-btn="false"
  >
    <div class="p-4" v-loading="loading">
      <!-- 汇总信息 -->
      <!-- <div class="mb-6">
        <h3 class="text-lg font-medium mb-4 text-gray-800">汇总信息</h3>
        <div class="grid grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <span class="text-gray-600">总投入金额:</span>
            <span class="ml-2 text-blue-600 font-medium">{{ summaryData.totalAmount }}</span>
          </div>
          <div>
            <span class="text-gray-600">已投入:</span>
            <span class="ml-2 text-blue-600 font-medium">{{ summaryData.actualAmount }}</span>
          </div>
          <div>
            <span class="text-gray-600">预计投入:</span>
            <span class="ml-2 text-blue-600 font-medium">{{ summaryData.predictedAmount }}</span>
          </div>
          <div>
            <span class="text-gray-600">对比增长:</span>
            <span class="ml-2 text-green-600 font-medium">{{ summaryData.growthRate }}</span>
          </div>
        </div>
      </div> -->

      <!-- 签字版文件 -->
      <div class="mb-6">
        <h3 class="text-lg font-medium mb-4 text-gray-800 flex items-center">
          <Icon icon="ant-design:file-text-outlined" class="mr-2" />
          签字版文件
        </h3>
        <div class="border border-gray-200 rounded-lg p-4 bg-white">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <Icon icon="ant-design:file-pdf-outlined" class="text-red-500 text-xl" />
              <div>
                <div class="text-gray-800 font-medium" v-if="currentRecord?.fileUrl">{{ currentRecord?.fileUrl.replace('temp/', '') }}</div>
                <!-- <div class="text-gray-500 text-sm">{{ fileInfo.uploadTime }} | {{ fileInfo.size }}</div> -->
              </div>
            </div>
            <div class="flex space-x-2">
              <a-button size="small" @click="handleDownloadFile" :disabled="!currentRecord?.fileUrl">
                <Icon icon="ant-design:download-outlined" class="mr-1" />
                下载
              </a-button>
              <a-button size="small" type="primary" @click="handleViewFile" :disabled="!currentRecord?.fileUrl"> 查看详情 </a-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="mb-4">
        <BasicTable @register="registerTable" />
      </div>

      <!-- 底部按钮 -->
      <div class="flex justify-end space-x-3 pt-4 border-gray-200">
        <!-- <a-button @click="handleClose">关闭</a-button> -->
        <!-- <a-button type="primary" @click="handleExportExcel">
          <Icon icon="ant-design:file-excel-outlined" class="mr-1" />
          导出Excel
        </a-button> -->
      </div>
    </div>
  </BasicModal>
</template>

<script lang="ts" setup>
  import { ref, computed } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { BasicTable } from '/@/components/Table';
  import { useListPage } from '/@/hooks/system/useListPage';
  import { Icon } from '/@/components/Icon';
  import { investLedgerView } from './api';
  import { previewFile } from '/@/api/common/api';
  const currentRecord = ref<any | null>(null);
  const loading = ref(false);
  const modalTitle = computed(() => {
    if (!currentRecord.value) return '';
    return `${currentRecord.value.year}年敬业集团本部基地安全投入费用预算汇总`;
  });

  const columns = ref([
    {
      title: '单位',
      dataIndex: 'orgCode',
      width: 150,
    },
    {
      title: '2024年预算',
      dataIndex: 'lastYearBudget',
      width: 120,
      customRender: ({ text }) => text?.toLocaleString(),
    },
    {
      title: '2024年至年预计',
      dataIndex: 'lastYearEstimatedAmount',
      width: 140,
      customRender: ({ text }) => text?.toLocaleString(),
    },
    {
      title: '2025年预算',
      dataIndex: 'currentYearBudgetAmount',
      width: 120,
      customRender: ({ text }) => text?.toLocaleString(),
    },
    {
      title: '与2024年预算对比',
      dataIndex: 'compareLastYear',
      width: 140,
      customRender: ({ text }) => text?.toLocaleString(),
    },
    {
      title: '增长比例',
      dataIndex: 'increaseDecreaseRatio',
      width: 120,
      customRender: ({ text }) => text?.toLocaleString() + '%',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 100,
    },
  ]);

  const tableData = ref<any[]>([]);

  const { tableContext } = useListPage({
    tableProps: {
      columns: columns.value,
      dataSource: tableData,
      pagination: false,
      showSummary: true,
      useSearchForm: false,
      showActionColumn: false,
      showIndexColumn: true,
      summaryFunc: onSummary,
    },
  });
  const [registerTable, { setColumns }] = tableContext;
  function onSummary() {
    return [{ _index: '合计', orgCode: '合计', ...currentRecord.value.total }];
  }
  // 更新列标题的函数
  const updateColumnsTitle = (year) => {
    return columns.value.map((item) => {
      if (item.dataIndex === 'lastYearBudget') {
        item.title = `${year - 1}年预算`;
      }
      if (item.dataIndex === 'lastYearEstimatedAmount') {
        item.title = `${year - 1}年全年预计`;
      }
      if (item.dataIndex === 'currentYearBudgetAmount') {
        item.title = `${year}年预算`;
      }
      if (item.dataIndex === 'compareLastYear') {
        item.title = `与${year - 1}年预算对比`;
      }
      return item;
    });
  };

  const [registerModal, { setModalProps }] = useModalInner((data) => {
    loading.value = true;
    setColumns(updateColumnsTitle(Number(data.year)));
    investLedgerView({ id: data.id })
      .then((res) => {
        currentRecord.value = res;
        tableData.value = res.items;
      })
      .finally(() => {
        loading.value = false;
      });
    setModalProps({ confirmLoading: false });
  });

  const handleDownloadFile = () => {
    if (currentRecord.value?.fileUrl) {
      window.open(getFileAccessHttpUrl(currentRecord.value?.fileUrl));
    }
  };

  const handleViewFile = () => {
    previewFile(currentRecord.value?.fileUrl).then((res) => {
      window.open(res, '_blank');
    });
  };
</script>

<style scoped>
  .grid {
    display: grid;
  }

  .grid-cols-4 {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .gap-4 {
    gap: 1rem;
  }
</style>
