<template>
  <div class="dangerous-statistics">
    <div class="title">
      危险作业明细
      <span @click="showDatePicker = true" class="date-range">{{ dateRangeText }}</span>
    </div>
    <van-calendar :min-date="minDate" :max-date="maxDate" allow-same-day type="range" v-model:show="showDatePicker" @confirm="onDateConfirm" />
    <div class="company-card">
      <div class=""><van-icon class="icon" name="wap-home" color="#666666" size="20px" /> 申请单位：{{ orgName }}</div>
    </div>
    <div class="main">
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list v-model:loading="loading" :finished="finished" offset="100" finished-text="没有更多了" @load="onLoad">
          <template v-for="company in companyList" :key="company.orgName">
            <div class="company-card">
              <div class="hd">{{ company.workContent }}</div>
              <div>作业车间：{{ company.workUnit }}</div>
              <div>作业班组：{{ company.workTeam }}</div>
              <div>作业类型：{{ company.workType }}</div>
              <div>作业地点：{{ company.workLocation }}</div>
              <div class="company-stats">
                <div class="tit">作业记录</div>
                <div class="li" v-for="item in company.workEndTime" :key="item.workStartTime">
                  <div class="time"><van-icon class="icon" name="underway-o" />{{ item.workStartTime }} - {{ item.workEndTime }}</div>
                  <template v-if="item.unitChild && item.unitChild.length > 0">
                    <div class="se-v">
                      <div class="tit">单位检查</div>
                      <div class="status-item" v-for="child in item.unitChild" :key="child.workCheckTimeChild">
                        <div class="status-item-name"
                          ><van-icon class="icon" name="passed" color="#07c160" />{{ child.workCheckTimeChild }} - {{ child.userName }} -
                          {{ child.result }}</div
                        >
                      </div>
                    </div>
                  </template>
                  <template v-if="item.companyChild && item.companyChild.length > 0">
                    <div class="se-v">
                      <div class="tit">公司检查</div>
                      <div class="status-item" v-for="child in item.unitChild" :key="child.workCheckTimeChild">
                        <div class="status-item-name"
                          ><van-icon class="icon" name="passed" color="#07c160" />{{ child.workCheckTimeChild }} - {{ child.userName }} -
                          {{ child.result }}</div
                        >
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </template>
        </van-list>
      </van-pull-refresh>
    </div>
    <Loading v-if="curloading" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, onBeforeUnmount } from 'vue';
  import { workReportDetails } from '../../../hazardousOperation/api';
  import Loading from '../../components/loading.vue';
  // 日期区间
  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2060, 12, 31);
  const now = new Date();
  const dateRangeText = ref(formatDate(now) + ' 至 ' + formatDate(now));
  const showDatePicker = ref(false);

  // mock 公司数据
  const companyList = ref<any[]>([]);
  const loading = ref(false);
  const finished = ref(false);
  const refreshing = ref(false);
  const pageNo = ref(1);
  const pageSize = ref(10);
  const curloading = ref(false);

  const orgCode = ref('');
  const orgName = ref('');

  function onDateConfirm(val) {
    showDatePicker.value = false;
    if (val && val.length === 2) {
      const [start, end] = val;
      dateRangeText.value = `${formatDate(start)} 至 ${formatDate(end)}`;
    }
    sessionStorage.removeItem('company-D');
    curloading.value = true;
    onRefresh();
  }
  onBeforeUnmount(() => {
    sessionStorage.removeItem('company-D');
  });

  const onRefresh = () => {
    // 清空列表数据
    finished.value = false;

    // 重新加载数据
    // 将 loading 设置为 true，表示处于加载状态
    loading.value = true;
    pageNo.value = 1;
    companyList.value = [];
    onLoad();
  };
  const onLoad = async () => {
    let company = JSON.parse(sessionStorage.getItem('company-D') || '{}');
    if (company.time) {
      orgCode.value = company.orgCode;
      orgName.value = company.orgName;
      dateRangeText.value = `${company.time.split(',')[0]} 至 ${company.time.split(',')[1]}`;
    }
    const res = await workReportDetails({
      flag: '',
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      orgCode: orgCode.value,
      startDate: dateRangeText.value.split('至')[0],
      endDate: dateRangeText.value.split('至')[1],
    });

    if (refreshing.value) {
      companyList.value = [];
      refreshing.value = false;
    }
    curloading.value = false;
    companyList.value.push(...res.records);
    loading.value = false;
    active.value = false;
    if (companyList.value.length >= res.total) {
      finished.value = true;
    } else {
      pageNo.value++;
    }
  };
  function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
</script>

<style lang="less" scoped>
  .dangerous-statistics {
    width: 100%;
    padding: 12px;
    background: #f7f8fa;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    .main {
      width: 100%;
      height: calc(100vh - 117px);
      overflow-y: auto;
    }
  }
  .title {
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    span {
      font-weight: 400;
      display: flex;
      align-items: center;
    }
    .date-range {
      &::after {
        content: '';
        display: inline-block;
        width: 0px;
        height: 0px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #666;
        margin-left: 4px;
      }
    }
  }
  .dangerous-statistics {
    padding: 12px;
    background: #f7f8fa;
    min-height: 100vh;
  }
  .overall-statistics {
    background: #fff;
    border-radius: 8px;
    margin: 16px 0;
    padding: 12px 0;
    box-shadow: 0 2px 8px #f0f1f2;
    .tit {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 12px;
      margin-bottom: 12px;
    }
  }
  .company-card {
    margin-bottom: 12px;
    background: #fff;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 8px #f0f1f2;
    .hd {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 14px;
      font-weight: bold;
    }
    .tit {
      font-size: 14px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  }
  .company-stats {
    width: 100%;
    font-size: 14px;
    margin-top: 10px;
    padding-top: 12px;
    border-top: 1px solid #f0f1f2;
    .li {
    }
  }
  .stat-blue {
    color: #1989fa;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    span:nth-child(2) {
      color: #666;
    }
  }
  .status-item {
    padding: 4px 0;
    &:last-child {
      border-bottom: none;
    }
  }
  .stat-green {
    color: #07c160;
  }
  .stat-orange {
    color: #ff976a;
  }
  .stat-red {
    color: #ee0a24;
  }
  .icon {
    margin-right: 4px;
    font-size: 16px;
  }
  .se-v {
    padding-left: 12px;
    padding-bottom: 10px;
    font-size: 12px;
    .tit{
      font-size: 12px;
    }
  }
</style>
