<template>
  <div class="processing-page">
    <!-- 左侧部门树 -->
    <a-card class="department-menu" title="部门">
      <a-menu v-model:selectedKeys="selectedKeys" mode="inline" style="border: none" @select="handleMenuSelect">
        <a-menu-item v-for="item in orgOptions" :key="item.value">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </a-card>
    <!-- 右侧主内容 -->
    <div class="processing-content">
      <!-- 头部信息 -->
      <div class="content-header">
        <a-button type="link" preIcon="ant-design:arrow-left-outlined" @click="goBack">返回</a-button>
        <div class="header-actions">
          <a-button type="primary" :loading="loading" @click="handleOpenStatistics">开始计算</a-button>
          <a-button @click="handleExport">导出</a-button>
        </div>
      </div>
      <!-- 加载指示器 -->
      <div v-if="loading" class="loading-overlay">
        <a-spin :tip="tip" size="large" />
      </div>
      <!-- 标题和时间 -->
      <div class="title-section">
        <h2>{{ orgName }}{{ route.query.title }}</h2>
        <div class="time-info">生成时间: {{ route.query.generateTime }}</div>
      </div>
      <!-- 申报汇总、申报明细、报料明细标签页 -->
      <a-tabs v-model:activeKey="activeTab" type="card" style="padding: 10px 15px">
        <a-tab-pane key="summary" tab="申报汇总">
          <!-- 动态表格容器 -->
          <div class="tables-container" v-if="summaryTables.length > 0">
            <div
              v-for="(tableConfig, index) in summaryTables"
              :key="index"
              class="summary-table-wrapper"
              :style="{ marginTop: index > 0 ? '20px' : '0' }"
            >
              <h3>{{ tableConfig.title }}</h3>
              <a-table
                :columns="tableConfig.columns"
                :data-source="tableConfig.data"
                :pagination="false"
                :scroll="{ x: 1500 }"
                bordered
                size="small"
                :customRow="
                  (_record, index) => {
                    return {
                      class: index === tableConfig.data.length - 1 ? 'summary-row' : '',
                    };
                  }
                "
              >
                <template #bodyCell="{ column, text }">
                  <template v-if="column.dataIndex === 'department'">
                    <span class="department-cell">{{ text }}</span>
                  </template>
                  <template v-else>
                    <span>{{ text || 0 }}</span>
                  </template>
                </template>
              </a-table>
            </div>
          </div>
          <a-empty style="margin-top: 60px" v-else description="暂无结果" />
        </a-tab-pane>
        <a-tab-pane key="detail" tab="申报明细">
          <!-- 复杂表格 -->
          <div class="tables-container" v-if="complexData.length > 0">
            <a-table :columns="complexColumns" :data-source="complexData" :pagination="false" :scroll="{ x: 1500 }" bordered size="small">
              <template #bodyCell="{ column, text }">
                <template
                  v-if="
                    column.dataIndex === '序号' ||
                    column.dataIndex === '班组' ||
                    column.dataIndex === '车间' ||
                    column.dataIndex === '编码' ||
                    column.dataIndex === '姓名' ||
                    column.dataIndex === '岗位名称'
                  "
                >
                  <span class="department-cell">{{ text }}</span>
                </template>
                <template v-else>
                  <span>{{ text }}</span>
                </template>
              </template>
            </a-table>
          </div>
          <a-empty style="margin-top: 60px" v-else description="暂无结果" />
        </a-tab-pane>
        <a-tab-pane key="material" tab="报料明细（仓库）">
          <div class="material-detail-container">
            <!-- 顶部金额显示 -->
            <div class="amount-display">
              <span class="amount-text">
                本月合计金额: <span class="amount-value">{{ formattedTotalAmount }}</span>
              </span>
            </div>
            <!-- 物料明细表格 -->
            <a-table :columns="materialColumns" :data-source="materialData" :pagination="false" bordered size="small">
              <template #bodyCell="{ column, text }">
                <template v-if="column.dataIndex === 'materialCode'">
                  <span class="material-code">{{ text }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'materialName'">
                  <span class="material-name">{{ text }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'demandPersonnel'">
                  <span class="demand-personnel" :title="text">{{ text }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'unitPrice'">
                  <span class="unit-price">{{ formatMoney(Number(text)) }}</span>
                </template>
                <template v-else-if="column.dataIndex === 'amount'">
                  <span class="amount">{{ formatMoney(Number(text)) }}</span>
                </template>
                <template v-else>
                  <span>{{ text }}</span>
                </template>
              </template>
            </a-table>
          </div>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script setup name="equipmentManage-declarationAndIssuance-processing" lang="ts">
  import { ref, onMounted, computed } from 'vue';
  import { useRouter, useRoute } from 'vue-router';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { formatMoney } from '/@/utils/index';
  import { useMethods } from '/@/hooks/system/useMethods';
  import { queryById, calculate } from './api';
  const { handleExportXlsx } = useMethods();
  const router = useRouter();
  const route = useRoute();
  const selectedKeys = ref(['first-steel-1']);
  const activeTab = ref('summary');
  const orgOptions: any = ref([]);
  const orgName = ref('');
  const loading = ref(false);
  const summaryTables: any = ref([]);
  const totalAmount: any = ref(0);
  const tip = ref('');
  // 复杂表格列配置
  const complexColumns = ref([]);
  // 复杂表格数据
  const complexData = ref([]);
  // 物料明细表格列配置
  const materialColumns = ref([
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      key: 'materialCode',
      width: 150,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      key: 'materialName',
      width: 150,
      fixed: 'left',
      align: 'center',
    },
    {
      title: '规格型号',
      dataIndex: 'specification',
      key: 'specification',
      width: 150,
      align: 'center',
    },
    {
      title: '申请数量',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 150,
      align: 'center',
    },
    {
      title: '计量单位',
      dataIndex: 'unit',
      key: 'unit',
      width: 120,
      align: 'center',
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 180,
      align: 'center',
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'center',
    },
    {
      title: '需求人员',
      dataIndex: 'demandPersonnel',
      key: 'demandPersonnel',
      width: 400,
      align: 'left',
    },
  ]);
  // 报料明细数据
  const materialData = ref([]);

  // 格式化总金额（带货币符号）
  const formattedTotalAmount = computed(() => {
    return formatMoney(totalAmount.value, { prefix: '￥' });
  });
  onMounted(() => {
    getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => ({
        label: item.departName,
        value: item.orgCode,
      }));
      selectedKeys.value = [orgOptions.value[0].value];
      orgName.value = orgOptions.value[0].label;
      initDetail();
    });
  });
  const handleMenuSelect = (key: any) => {
    selectedKeys.value = [key.key];
    orgName.value = orgOptions.value.find((item) => item.value === key.key)?.label;
    activeTab.value = 'summary';
    initDetail();
  };
  const initDetail = () => {
    loading.value = true;
    tip.value = '加载中...';
    queryById({
      id: route.query.id,
      orgCode: selectedKeys.value[0],
    })
      .then((res) => {
        structuralProcessing(res);
      })
      .finally(() => {
        loading.value = false;
      });
  };
  // 结构处理
  const structuralProcessing = (res) => {
    summaryTables.value = [];
    complexColumns.value = [];
    complexData.value = [];
    totalAmount.value = Number(res.totalAmount) || 0;
    // 申请汇报开始
    if (res.summaryByDepart && res.summaryByDepart.length > 0) {
      const summary: any = {};
      summary.title = '用品汇总表';
      summary.columns = res.summaryByDepart[0].map((item, index) => {
        return {
          title: item,
          dataIndex: item,
          key: item,
          width: 120,
          fixed: index === 0 ? 'left' : index === res.summaryByDepart[0].length - 1 ? 'right' : undefined,
          align: 'center',
        };
      });
      // 解构：第一个是 keys，其余是 values
      const [keys, ...values] = res.summaryByDepart;
      summary.data = values.map((valueArr) => {
        const obj = {};
        valueArr.forEach((val, index) => {
          obj[keys[index]] = val;
        });
        return obj;
      });
      summaryTables.value.push(summary);
    }
    if (res.summaryBySupply) {
      Object.keys(res.summaryBySupply).forEach((item) => {
        const data: any = {};
        data.title = item;
        data.columns = res.summaryBySupply[item][0].map((ite, index) => {
          return {
            title: ite,
            dataIndex: ite,
            key: ite,
            width: 120,
            fixed: index === 0 ? 'left' : index === res.summaryBySupply[item][0].length - 1 ? 'right' : undefined,
            align: 'center',
          };
        });
        // 解构：第一个是 keys，其余是 values
        const [keys, ...values] = res.summaryBySupply[item];
        data.data = values.map((valueArr) => {
          const obj = {};
          valueArr.forEach((val, index) => {
            obj[keys[index]] = val;
          });
          return obj;
        });
        summaryTables.value.push(data);
      });
    }
    // 申请汇报结束
    // 申报明细开始
    if (res.detailPersonal && res.detailPersonal.length > 0) {
      complexColumns.value = generateAntdvColumns(res.detailPersonal.slice(0, 2));
      complexData.value = parseToDataSource(res.detailPersonal, complexColumns.value);
    }
    // 申报明细结束
    materialData.value =
      res.detailSupply?.map((item, index) => {
        item.index = index + 1;
        return item;
      }) || [];
  };
  const generateAntdvColumns = (headerData) => {
    // headerData 是一个二维数组，[0] 是第一行，[1] 是第二行
    const [row1, row2] = headerData;
    const columns: any = [];
    let i = 0;
    while (i < row1.length) {
      const title1 = row1[i]; // 第一行的标题
      const title2 = row2[i]; // 第二行的标题
      if (title1) {
        // 当前行有第一级标题（如 "工作服"）
        const colSpan = countSpan(row1, i); // 计算这个标题跨多少列

        // 创建一个父级列
        const parentColumn: any = {
          title: title1,
          children: [],
        };
        // 从 i 开始，往后 colSpan * 2 列（因为每项有“数量”和“规格型号”）
        for (let j = 0; j < colSpan * 2; j += 2) {
          parentColumn.children.push(
            { title: row2[i + j], dataIndex: title1 + row2[i + j], key: row2[i + j], width: 150, align: 'center' },
            { title: row2[i + j + 1], dataIndex: title1 + row2[i + j + 1], key: row2[i + j + 1], width: 150, align: 'center' }
          );
        }
        columns.push(parentColumn);
        i += colSpan * 2; // 跳过已处理的列
      } else {
        // 没有第一级标题，直接使用第二行标题（如 序号、班组等）
        columns.push({
          title: title2,
          dataIndex: title2,
          key: title2,
          width: title2 == '序号' ? 80 : 150,
          fixed: 'left',
          align: 'center',
        });
        i++;
      }
    }

    return columns;
  };
  // 计算从位置 i 开始，第一行中连续非空单元格的个数（即合并列数）
  function countSpan(row, startIndex) {
    let count = 0;
    for (let i = startIndex; i < row.length; i++) {
      if (row[i] !== '') {
        count++;
      } else {
        break;
      }
    }
    return count;
  }
  // 申报明细取值
  const parseToDataSource = (rawData, columns) => {
    const dataRows = rawData.slice(2); // 跳过前两行表头
    const fieldMap: any = [];
    // 提取所有 dataIndex（按列顺序）
    columns.forEach((col: any) => {
      if (col.children) {
        col.children.forEach((child: any) => {
          fieldMap.push(child.dataIndex);
        });
      } else {
        fieldMap.push(col.dataIndex);
      }
    });
    return dataRows.map((row, index) => {
      const item: any = { key: String(index) };

      fieldMap.forEach((field, colIndex) => {
        item[field] = row[colIndex] || '';
      });
      return item;
    });
  };
  const goBack = () => {
    router.go(-1);
  };
  const handleOpenStatistics = () => {
    // 开始计量逻辑
    loading.value = true;
    tip.value = '正在计算中，请稍后...';
    calculate({
      id: route.query.id,
      orgCode: selectedKeys.value[0],
    })
      .then((res) => {
        structuralProcessing(res);
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const handleExport = () => {
    // 导出逻辑
    handleExportXlsx(`${orgName.value}${route.query.title}`, '/lb/lbDeclaration/exportXls', {
      id: route.query.id,
      orgCode: selectedKeys.value[0],
    });
  };
</script>

<style lang="less" scoped>
  .processing-page {
    display: flex;
    margin: 0 10px;
    padding-top: 10px;
    height: calc(100vh - 10px);
    overflow: hidden;
  }

  .department-menu {
    width: 250px;
    min-width: 180px;
    padding: 0;
    border-radius: 8px;
  }
  .processing-content {
    background-color: #fff;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    margin-left: 10px;
    width: calc(100% - 260px);
    display: flex;
    flex-direction: column;

    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 15px;
      border-bottom: 1px solid #f0f0f0;
      .header-actions {
        button {
          margin-left: 8px;
        }
      }
    }

    .title-section {
      padding: 15px;
      h2 {
        margin: 0 0 10px 0;
        font-size: 18px;
        color: #262626;
      }

      .time-info {
        color: #666;
        font-size: 14px;
      }
    }
    .department-cell {
      font-weight: bold;
      color: #1890ff;
    }
    .tables-container {
      .summary-table-wrapper {
        margin-bottom: 20px;
        h3 {
          margin-bottom: 10px;
          color: #262626;
          font-size: 16px;
          font-weight: 600;
        }
        // 合计行样式
        :deep(.summary-row) {
          font-weight: bold;
          .ant-table-cell {
            background-color: #f6ffed !important;
            border-top: 1px solid #52c41a !important;
            text-align: center;
          }
        }
      }
    }

    .material-detail-container {
      .amount-display {
        text-align: right;
        margin-bottom: 15px;
        padding: 10px;
        background: #f6ffed;
        border-radius: 4px;
        border: 1px solid #b7eb8f;

        .amount-text {
          font-size: 14px;
          color: #262626;
        }

        .amount-value {
          font-size: 16px;
          font-weight: bold;
          color: #f5222d;
        }
      }
      .material-code {
        font-family: 'Courier New', monospace;
        font-weight: 600;
        color: #1890ff;
      }

      .material-name {
        font-weight: 500;
        color: #262626;
      }

      .demand-personnel {
        max-width: 400px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        display: inline-block;
      }

      .unit-price {
        color: #52c41a;
        font-weight: 500;
      }

      .amount {
        color: #f5222d;
        font-weight: bold;
      }
    }
  }

  :deep(.ant-card-body) {
    padding: 5px 0 !important;
    height: calc(100% - 61px);
    overflow-y: auto;
    & > ul {
      padding: 0 15px !important;
    }
  }
  :deep(.ant-card-head) {
    border-bottom: 1px solid #f0f0f0;
  }

  :deep(.ant-menu-item) {
    padding: 0 10px !important;
  }

  :deep(.ant-tabs-card > .ant-tabs-content) {
    height: calc(100vh - 320px);
    overflow: auto;
  }

  :deep(.ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane) {
    background: #fff;
    padding: 15px;
  }

  :deep(.ant-tabs-card .ant-tabs-tab) {
    background: #fafafa;
    border: 1px solid #d9d9d9;
    margin-left: 10px !important;
  }
  :deep(.ant-tabs-tab:nth-child(1)) {
    margin-left: 0 !important;
  }

  :deep(.ant-tabs-card .ant-tabs-tab-active) {
    background: #fff;
  }
  :deep(.ant-tabs-content-holder) {
    overflow-y: auto;
  }

  // 加载覆盖层样式
  .loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
</style>
