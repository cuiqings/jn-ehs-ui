<template>
  <div class="jobAccounting">
      <div class="header">
        申请时间：<a-range-picker format="YYYY-MM-DD" :allowClear="false" value-format="YYYY-MM-DD" @change="getData" v-model:value="date" />
      </div>
      <a-table :loading="loading" :columns="columns" :data-source="data" :pagination="false" bordered>
         <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index' && record.departName != '合计'">
            {{ index + 1 }}
          </template>
        </template>
        <template #summary>
          <a-table-summary-row :row-span="2">
            <a-table-summary-cell>备注</a-table-summary-cell>
            <a-table-summary-cell :col-span="13">
              <a-typography-text type="danger">
                <div>{{ remark }}</div>
                <div>{{ remartTwo }}</div>
              </a-typography-text>
            </a-table-summary-cell>
          </a-table-summary-row>
        </template>
      </a-table>
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, ref, Ref } from 'vue';
  import { getDangerousData } from './jobAccounting.api';
  import dayjs from 'dayjs';

// 默认当天
  const date = ref<any[]>([dayjs().format('YYYY-MM-DD'), dayjs().format('YYYY-MM-DD')]);
  const data = ref<any[]>([]);
  const totals = ref<any>({
    totalBorrow: 0,
    totalRepayment: 0,
  });
  const loading = ref(false);
  const columns: any[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: '单位',
      dataIndex: 'departName',
    },
    {
      title: '一级高危作业',
      dataIndex: 'workTeam',
      children: [
        {
          title: '申请数量',
          dataIndex: 'applyNum',
          key: 'applyNum',
        },
        {
          title: '未完结数量',
          dataIndex: 'unfinishedNum',
          key: 'unfinishedNum',
        },
        {
          title: '完结数量',
          dataIndex: 'finishedNum',
          key: 'finishedNum',
        },
        {
          title: '安全部检查次数',
          dataIndex: 'checkNum',
          key: 'checkNum',
          width: 140,
        },
        {
          title: '问题数量',
          dataIndex: 'problemNum',
          key: 'problemNum',
        },
        {
          title: '检查比例',
          dataIndex: 'checkRatio',
          key: 'checkRatio',
        },
      ],
    },
    {
      title: '二级高危作业',
      dataIndex: 'workType',
      children: [
        {
          title: '申请数量',
          dataIndex: 'applyNumTwo',
          key: 'applyNumTwo',
        },
        {
          title: '未完结数量',
          dataIndex: 'unfinishedNumTwo',
          key: 'unfinishedNumTwo',
        },
        {
          title: '完结数量',
          dataIndex: 'finishedNumTwo',
          key: 'finishedNumTwo',
        },
        {
          title: '安全部检查次数',
          dataIndex: 'checkNumTwo',
          key: 'checkNumTwo',
          width: 140,
        },
        {
          title: '问题数量',
          dataIndex: 'problemNumTwo',
          key: 'problemNumTwo',
          width: 130,
        },
        {
          title: '检查比例',
          dataIndex: 'checkRatioTwo',
          key: 'checkRatioTwo',
        },
      ],
    },
  ];

  onMounted(async () => {
    getData();
  });
  const remark = ref('');
  const remartTwo = ref('');
  async function getData() {
    loading.value = true;
    let res = await getDangerousData({
      startDate: date.value[0],
      endDate: date.value[1],
    }).finally(() => {
      loading.value = false;
    });
    remark.value = res.remark;
    remartTwo.value = res.remarkTwo;
    data.value = res.list;
    console.log(res);
  }
</script>

<style lang="less" scoped>
  :deep(.ant-table-thead th) {
    text-align: center !important;
  }
  :deep(.ant-table-tbody > tr > td) {
    text-align: center !important;
    padding: 5px 10px;
  }
  .jobAccounting {
    height: 100%;
    padding: 10px;
    background-color: #fff;

    .header {
      height: 35px;
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .inner {
      width: 100%;
      height: 100%;
      padding: 15px;
      flex-direction: column;
      display: flex;
      justify-content: space-between;
    }
    .top,
    .bottom {
      padding: 0 10px;
      height: auto;
      border: 1px solid rgba(215, 215, 215, 1);
      display: flex;
      flex-direction: column;
    }
    .top {
      height: calc(50% - 7.5px);
    }
  }
  .red {
    color: #ff4d4f;
  }
  .yellow {
    color: orange;
  }
  .t-b {
    display: flex;
    .right {
      width: 520px;
      height: 100%;
      .rosebar {
        width: 100%;
        height: 100%;
      }
    }
  }
</style>
