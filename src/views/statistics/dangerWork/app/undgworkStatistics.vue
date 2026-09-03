<template>
  <div class="app-danger-work">
    <div class="sratch-btn" @click="showSearch = true">
      <img src="../../../../assets/images/app/hazardous/filter.png" />
    </div>
    <div class="items">
      <div class="item" v-for="item in levelList" @click="levelClick(item.id)" :class="{ active: queryParams.level === item.id }">
        <div class="tit">{{ item.text }}</div>
        <div
          class="num"
          :style="{ color: item.text === '审批中' ? '#e94141' : item.text === '待作业' ? '#ff8f00' : item.text === '作业中' ? '#0b88e3' : '' }"
          >{{ item.value }}</div
        >
      </div>
    </div>
    <div class="list-main">
      <ListEl :list="list" :total="total" ref="listRef" @onLoad="onLoad" @onRefresh="onRefresh" />
    </div>
    <van-popup v-model:show="showSearch" position="top">
      <div class="search-box">
        <div class="item">
          <span class="item-label">时间：</span>
          <div class="value" @click="timeClick">
            <span>{{ queryParams.startTime || '开始时间' }}</span> ~ <span>{{ queryParams.endTime || '结束时间' }}</span>
          </div>
        </div>
        <van-calendar :min-date="minDate" :max-date="maxDate" allow-same-day type="range" v-model:show="showDatePicker" @confirm="onDateConfirm" />
        <div class="item">
          <span class="item-label">单位：</span>
          <div class="value">
            <van-button
              round
              size="small"
              v-for="item in orgList"
              :type="queryParams.orgCode === item.orgCode ? 'primary' : 'default'"
              @click="orgClick(item)"
              >{{ item.departName }}</van-button
            >
          </div>
        </div>
        <div class="item">
          <span class="item-label">车间：</span>
          <div class="value">
            <van-button
              round
              size="small"
              v-for="item in departList"
              :type="queryParams.workOrgCode === item.orgCode ? 'primary' : 'default'"
              @click="departClick(item)"
            >{{ item.departName }}</van-button
            >
          </div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { selectDeptNew } from '/@/api/common/api';
  import { getAppWorkStatusCount, getAppWorkList } from '../api';
  import ListEl from '../../components/unDlist.vue';
  import { ref, onMounted, nextTick } from 'vue';
  import { useContent } from '../hooks/useContent';
  import dayjs from 'dayjs';
  const { columns, columns2 } = useContent();
  const showSearch = ref(false);
  const queryParams = ref({
    startTime: dayjs().format('YYYY-MM-DD'),
    endTime: dayjs().format('YYYY-MM-DD'),
    orgCode: '',
    workOrgCode: '',
    workType: '',
    workState: '',
    orgName: '',
    level: '',
  });
  const levelList = ref<any[]>([
    { value: '', id: '', text: '作业总数', key: 'total' },
    { value: '0', id: '1', text: '审批中', key: 'approving' },
    { value: '0', id: '2', text: '待作业', key: 'pending' },
    { value: '0', id: '3', text: '作业中', key: 'working' },
    { value: '0', id: '7', text: '作业中断', key: 'interrupted' },
    { value: '0', id: '5', text: '已验收', key: 'accepted' },
  ]);
  const orgList = [
    { departName: '全部单位', orgCode: '' },
    { departName: '一炼铁', orgCode: 'A04B01C01' },
    { departName: '二炼铁', orgCode: 'A04B01C02' },
    { departName: '三炼铁', orgCode: 'A04B01C03' },
    { departName: '一炼钢', orgCode: 'A04B01C04' },
    { departName: '二炼钢', orgCode: 'A04B01C05' },
    { departName: '棒材', orgCode: 'A04B01C07' },
    { departName: '热卷板', orgCode: 'A04B01C06' },
    { departName: '原料', orgCode: 'A04B01C18' },
    { departName: '辅料', orgCode: 'A04B01C19' },
    { departName: '动力', orgCode: 'A04B01C10' },
    { departName: '维修', orgCode: 'A04B01C16' },
    { departName: '高品钢', orgCode: 'A04B01C08' },
    { departName: '宽厚板', orgCode: 'A04B02C01' },
  ];
  const departList = ref<any[]>([
    { departName: '全部单位', orgCode: '' },
  ]);
  // 日期区间
  const minDate = new Date(2023, 0, 1);
  const maxDate = new Date(2060, 12, 31);
  const showDatePicker = ref(false);
  const onDateConfirm = (val) => {
    showDatePicker.value = false;
    if (val && val.length === 2) {
      const [start, end] = val;
      queryParams.value.startTime = dayjs(start).format('YYYY-MM-DD');
      queryParams.value.endTime = dayjs(end).format('YYYY-MM-DD');
      onRefresh();
      getCount();
    }
  };
  const timeClick = () => {
    showDatePicker.value = true;
  };
  const orgClick = (item) => {
    queryParams.value.orgCode = item.orgCode;
    selectDeptNew({orgCode: item.orgCode}).then(res => {
      if(!res) {
        departList.value = [{ departName: '全部单位', orgCode: '' }];
      }
      departList.value = [{ departName: '全部单位', orgCode: '' }, ...res];
    })
    onRefresh();
    getCount();
  };
  const departClick = (item) => {
    queryParams.value.workOrgCode = item.orgCode;
    onRefresh();
    getCount();
  };

  const levelClick = (id) => {
    queryParams.value.workState = id;
    onRefresh();
  };

  const onLoad = async (params) => {
    let res = await getList(params);
    list.value = [...list.value, ...res];
    nextTick(() => {
      listRef.value.loadEnd();
    });
  };
  const onRefresh = async () => {
    let res = await getList({ pageNo: 1 });
    list.value = res;
    console.log(list.value);
    
    nextTick(() => {
      listRef.value.refreshEnd();
    });
  };
  const total = ref(0);
  const listRef = ref<any>(null);
  const list = ref<any[]>([]);
  async function getList(params = {}) {
    let res = await getAppWorkList({ ...queryParams.value, ...params });
    total.value = res.total;
    return res.records;
  }

  const getCount = async () => {
    let res = await getAppWorkStatusCount(queryParams.value);
    if(!res) return;
      levelList.value.map(item => {
        if (res[item.key]) {
          item.value = res[item.key];
        } else {
          item.value = 0;
        }
      })
  };
  onMounted(() => {
    getCount();
  });

</script>

<style lang="less" scoped>
  .app-danger-work {
    height: 100%;
    padding: 10px;
    overflow: auto;
    .search-box {
      font-size: 12px;
      .item {
        display: flex;
        padding: 10px;
        .item-label {
          width: 45px;
          text-align: left;
        }
        .value {
          flex: 1;
        }
        .van-button {
          margin-right: 10px;
          margin-bottom: 10px;
        }
      }
    }
    .list-main {
    }
    .items {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      .item {
        width: 30%;
        height: 65px;
        background-color: #f0f6ff;
        border-radius: 4px;
        margin-bottom: 10px;
        padding: 10px;
        .num {
          color: #636363;
          text-align: center;
          font-size: 16px;
          font-weight: 800;
        }
      }
      .active {
        background-color: #c1daff;
      }
    }
    .sratch-btn {
      position: absolute;
      right: 10px;
      top: 10px;
      z-index: 999;
      img {
        width: 28px;
        height: 28px;
      }
    }
  }
</style>
