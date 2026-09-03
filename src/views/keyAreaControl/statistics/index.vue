<template>
  <a-card class="statistics" :bordered="false">
    <a-form ref="formRef" :model="queryParam" :label-col="labelCol" :wrapper-col="wrapperCol" @keyup.enter="searchQuery">
      <a-row :gutter="24">
        <a-col :md="6" :sm="12">
          <a-form-item label="所属机构">
            <a-select placeholder="请选择" v-model:value="queryParam.subsidiaryCode" :options="orgOptions" :disabled="orgOptions.length === 1" />
          </a-form-item>
        </a-col>
        <a-col :md="6" :sm="12">
          <a-form-item label="年份">
            <a-select v-model:value="queryParam.year">
              <a-select-option v-for="(item, index) in yearList" :key="index" :value="item.value">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :md="4" :sm="12">
          <div class="btn-list">
            <a-button type="primary" @click="searchQuery">查询</a-button>
            <a-button @click="searchReset" style="margin-left: 8px">重置</a-button>
          </div>
        </a-col>
      </a-row>
    </a-form>
    <a-divider />
    <a-spin class="load" v-if="loading" />
    <a-row v-else style="width: 1661px">
      <a-col :span="3" class="part" v-for="(item, index) in monthList" :key="index">
        <div class="title">{{ item }}月重点部位管控</div>
        <div>
          <a-button type="primary" ghost @click="showDetails(item)">查看</a-button>
        </div>
      </a-col>
      <a-empty class="load" v-if="monthList.length === 0" />
    </a-row>
    <StatisticsModal @register="registerModal" />
  </a-card>
</template>

<script lang="ts" setup>
  import { getOrganizationNew, getMonthList } from './statistics.api';
  import { onMounted, reactive, ref } from 'vue';
  import dayjs from 'dayjs';
  import StatisticsModal from './statisticsModal.vue';
  import { useModal } from '/@/components/Modal';

  const [registerModal, { openModal }] = useModal();
  const labelCol = reactive({
    xs: { span: 24 },
    sm: { span: 8 },
  });
  const wrapperCol = reactive({
    xs: { span: 24 },
    sm: { span: 16 },
  });
  const orgOptions: any = ref([]);
  const yearList: any = ref([]);
  const monthList: any = ref([]);
  const queryParam = reactive({
    subsidiaryCode: undefined,
    year: '',
  });
  const loading = ref(true);

  async function getOrgList() {
    getOrganizationNew().then(async (res) => {
      orgOptions.value = res.map((item: any) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
      if (orgOptions.value.length === 1) {
        queryParam.subsidiaryCode = orgOptions.value[0].value;
      }
      initData();
      searchQuery();
    });
  }

  function searchQuery() {
    getMonthList(queryParam).then((res) => {
      loading.value = false;
      monthList.value = res;
    });
  }

  function searchReset() {
    queryParam.subsidiaryCode = orgOptions.value.length === 1 ? orgOptions.value[0].value : undefined;
    initData();
    searchQuery();
  }

  function showDetails(item) {
    const { subsidiaryCode, year } = queryParam;
    const month = item < 10 ? `0${item}` : item;
    const orgArr = orgOptions.value.filter((v) => v.value === subsidiaryCode);
    const subsidiaryName = orgArr[0]?.label || '';
    const title = `${year}年${item}月${subsidiaryName}重点部位管控情况统计`;
    openModal(true, { month: `${year}-${month}`, subsidiaryCode, title });
  }

  function initData() {
    yearList.value = [];
    const year = dayjs(new Date()).format('YYYY');
    for (let i = 2023; i <= +year; i++) {
      yearList.value.push({
        name: i,
        value: i,
      });
    }
    queryParam.year = year;
  }

  onMounted(() => {
    getOrgList();
  });
</script>

<style lang="less" scoped>
  .statistics {
    height: 100%;

    .load {
      width: 100%;
      margin-top: 200px;
    }

    .part {
      background-color: #ffffff;
      background-image: url('../../../assets/images/fireFighting/bg.png');
      background-size: cover;
      padding: 32px;
      margin: 24px;

      .title {
        color: rgba(0, 0, 0, 0.87);
        font-size: 26px;
        font-family: Songti SC, Songti SC;
        margin-bottom: 118px;
      }
    }
  }
</style>
