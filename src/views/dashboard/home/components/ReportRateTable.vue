<template>
  <div class="report-rate-wrap">
    <div class="report-rate-grid">
      <!-- 高危作业人均报备率 -->
      <div class="rate-card">
        <div class="rate-card-header">
          <span class="card-label">高危作业人均报备率排名</span>
          <a-select
            v-model:value="highOrgCode"
            class="org-select"
            placeholder="全部单位"
            allowClear
            @change="fetchHighData"
          >
            <a-select-option
              v-for="org in orgOptions"
              :key="org.orgCode"
              :value="org.orgCode"
            >{{ org.orgName }}</a-select-option>
          </a-select>
        </div>
        <div class="rate-table-wrap">
          <a-spin :spinning="highLoading">
          <table class="rate-table">
            <thead>
              <tr>
                <th class="col-rank">序号</th>
                <th class="col-name">{{ highFilteredOrgName ? '车间' : '单位' }}</th>
                <th class="col-num">作业数量</th>
                <th class="col-num">人数</th>
                <th class="col-rate">人均报备率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in highRiskList" :key="item.orgCode">
                <td class="col-rank">
                  <span class="rank-badge" :class="getRankClass(idx, highRiskList.length)">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="col-name">{{ item.orgName }}</td>
                <td class="col-num">{{ item.workCount }}</td>
                <td class="col-num">{{ item.personCount.toLocaleString() }}</td>
                <td class="col-rate" :class="getRateClass(idx, highRiskList.length)">{{ item.reportRate }}%</td>
              </tr>
              <!-- 合计行 -->
              <tr v-if="highRiskTotal" class="total-row">
                <td class="col-rank"><span class="total-icon">Σ</span></td>
                <td class="col-name">{{ highFilteredOrgName ? highFilteredOrgName + '合计' : '全厂合计' }} <span class="total-count">({{ highRiskList.length }} 个{{ highFilteredOrgName ? '车间' : '事业部' }})</span></td>
                <td class="col-num">{{ highRiskTotal.workCount }}</td>
                <td class="col-num">{{ highRiskTotal.personCount.toLocaleString() }}</td>
                <td class="col-rate">{{ highRiskTotal.reportRate }}%</td>
              </tr>
            </tbody>
          </table>
          </a-spin>
        </div>
      </div>

      <!-- 非高危作业人均报备率 -->
      <div class="rate-card">
        <div class="rate-card-header">
          <span class="card-label">非高危作业人均报备率排名</span>
          <a-select
            v-model:value="nonHighOrgCode"
            class="org-select"
            placeholder="全部单位"
            allowClear
            @change="fetchNonHighData"
          >
            <a-select-option
              v-for="org in orgOptions"
              :key="org.orgCode"
              :value="org.orgCode"
            >{{ org.orgName }}</a-select-option>
          </a-select>
        </div>
        <div class="rate-table-wrap">
          <a-spin :spinning="nonHighLoading">
          <table class="rate-table">
            <thead>
              <tr>
                <th class="col-rank">序号</th>
                <th class="col-name">{{ nonHighFilteredOrgName ? '车间' : '单位' }}</th>
                <th class="col-num">作业数量</th>
                <th class="col-num">人数</th>
                <th class="col-rate">人均报备率</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in nonHighRiskList" :key="item.orgCode">
                <td class="col-rank">
                  <span class="rank-badge" :class="getRankClass(idx, nonHighRiskList.length)">
                    {{ idx + 1 }}
                  </span>
                </td>
                <td class="col-name">{{ item.orgName }}</td>
                <td class="col-num">{{ item.workCount }}</td>
                <td class="col-num">{{ item.personCount.toLocaleString() }}</td>
                <td class="col-rate" :class="getRateClass(idx, nonHighRiskList.length)">{{ item.reportRate }}%</td>
              </tr>
              <!-- 合计行 -->
              <tr v-if="nonHighRiskTotal" class="total-row">
                <td class="col-rank"><span class="total-icon">Σ</span></td>
                <td class="col-name">{{ nonHighFilteredOrgName ? nonHighFilteredOrgName + '合计' : '全厂合计' }} <span class="total-count">({{ nonHighRiskList.length }} 个{{ nonHighFilteredOrgName ? '车间' : '事业部' }})</span></td>
                <td class="col-num">{{ nonHighRiskTotal.workCount }}</td>
                <td class="col-num">{{ nonHighRiskTotal.personCount.toLocaleString() }}</td>
                <td class="col-rate">{{ nonHighRiskTotal.reportRate }}%</td>
              </tr>
            </tbody>
          </table>
          </a-spin>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { getReportRate, getSafetyStandardOrgCodeList } from '../api';

  interface ReportRateItem {
    orgCode: string;
    orgName: string;
    workCount: number;
    personCount: number;
    reportRate: number;
  }

  interface ReportRateTotal {
    workCount: number;
    personCount: number;
    reportRate: number;
  }

  interface OrgOption {
    orgCode: string;
    orgName: string;
  }

  const props = defineProps<{
    dateRange: any[];
  }>();

  const highRiskList = ref<ReportRateItem[]>([]);
  const nonHighRiskList = ref<ReportRateItem[]>([]);
  const highRiskTotal = ref<ReportRateTotal | null>(null);
  const nonHighRiskTotal = ref<ReportRateTotal | null>(null);
  const orgOptions = ref<OrgOption[]>([]);
  const highOrgCode = ref<string | undefined>(undefined);
  const nonHighOrgCode = ref<string | undefined>(undefined);
  const highLoading = ref(false);
  const nonHighLoading = ref(false);

  const highFilteredOrgName = computed(() => {
    if (!highOrgCode.value) return '';
    const org = orgOptions.value.find(o => o.orgCode === highOrgCode.value);
    return org ? org.orgName : '';
  });

  const nonHighFilteredOrgName = computed(() => {
    if (!nonHighOrgCode.value) return '';
    const org = orgOptions.value.find(o => o.orgCode === nonHighOrgCode.value);
    return org ? org.orgName : '';
  });

  const buildParams = (orgCode?: string) => {
    const params: any = {
      startDate: props.dateRange[0].format('YYYY-MM-DD'),
      endDate: props.dateRange[1].format('YYYY-MM-DD'),
    };
    if (orgCode) {
      params.orgCode = orgCode;
    }
    return params;
  };

  const fetchHighData = () => {
    if (!props.dateRange || props.dateRange.length < 2) return;
    highLoading.value = true;
    getReportRate(buildParams(highOrgCode.value)).then((res: any) => {
      if (res.success && res.result) {
        highRiskList.value = res.result.highRiskList || [];
        highRiskTotal.value = res.result.highRiskTotal || null;
      }
    }).finally(() => {
      highLoading.value = false;
    });
  };

  const fetchNonHighData = () => {
    if (!props.dateRange || props.dateRange.length < 2) return;
    nonHighLoading.value = true;
    getReportRate(buildParams(nonHighOrgCode.value)).then((res: any) => {
      if (res.success && res.result) {
        nonHighRiskList.value = res.result.nonHighRiskList || [];
        nonHighRiskTotal.value = res.result.nonHighRiskTotal || null;
      }
    }).finally(() => {
      nonHighLoading.value = false;
    });
  };

  const fetchOrgOptions = () => {
    getSafetyStandardOrgCodeList().then((res: any) => {
      // defHttp 默认解包，res 直接是数组
      const list = Array.isArray(res) ? res : (res.result || []);
      orgOptions.value = list.map((it: any) => ({
        orgCode: it.orgCode,
        orgName: it.departName || it.orgName,
      }));
    });
  };

  const fetchAll = () => {
    fetchHighData();
    fetchNonHighData();
    if (orgOptions.value.length === 0) {
      fetchOrgOptions();
    }
  };

  const getRankClass = (idx: number, listLen: number) => {
    if (idx < 3) return 'rank-gold';
    if (idx >= listLen - 3) return 'rank-red';
    return 'rank-gray';
  };

  const getRateClass = (idx: number, listLen: number) => {
    if (idx < 3) return 'rate-high';
    if (idx >= listLen - 3) return 'rate-low';
    return '';
  };

  watch(() => props.dateRange, fetchAll, { immediate: true });

  defineExpose({ fetchData: fetchAll });
</script>

<style scoped lang="less">
  .report-rate-wrap {
    margin-top: 20px;
  }

  .report-rate-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .rate-card {
    background: #fff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .rate-card-header {
    background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
    padding: 12px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-label {
    color: #fff;
    font-size: 14px;
    font-weight: 600;
  }

  .org-select {
    width: 140px;
    :deep(.ant-select-selector) {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.4);
      color: #fff;
    }
    :deep(.ant-select-arrow) {
      color: rgba(255, 255, 255, 0.8);
    }
    :deep(.ant-select-selection-placeholder) {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .rate-table-wrap {
    overflow-x: auto;
  }

  .rate-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;

    thead tr {
      background: #f5f7fa;

      th {
        padding: 10px 8px;
        color: #606266;
        font-weight: 500;
        border-bottom: 1px solid #ebeef5;
        white-space: nowrap;
      }
    }

    tbody tr {
      border-bottom: 1px solid #f5f5f5;

      &:hover {
        background: #f5f7fa;
      }
    }

    td {
      padding: 10px 8px;
    }

    .col-rank {
      width: 50px;
      text-align: center;
    }

    .col-name {
      text-align: center;
      white-space: nowrap;
    }

    .col-num {
      text-align: center;
      color: #606266;
      width: 80px;
    }

    .col-rate {
      text-align: center;
      font-weight: 500;
      width: 100px;
    }
  }

  // 序号徽章
  .rank-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 600;
    color: #fff;

    &.rank-gold {
      background: #f5b800;
    }
    &.rank-gray {
      background: #b8b8b8;
    }
    &.rank-red {
      background: #f56565;
    }
  }

  // 报备率颜色
  .rate-high {
    color: #16a34a;
    font-weight: 600;
  }
  .rate-low {
    color: #dc2626;
    font-weight: 600;
  }

  // 合计行
  .total-row {
    background: linear-gradient(135deg, #f0f9eb 0%, #e1f3d8 100%);
    border-top: 2px solid #67c23a;

    td {
      padding: 12px 8px;
      font-weight: 600;
    }

    .col-rate {
      color: #67c23a;
      font-size: 14px;
    }
  }

  .total-icon {
    color: #67c23a;
    font-size: 14px;
    font-weight: 600;
  }

  .total-count {
    font-size: 10px;
    color: #909399;
    font-weight: normal;
  }
</style>
