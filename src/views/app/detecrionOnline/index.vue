<!-- 在线检测 -->
<template>
  <div class="hiddendanger">
    <div class="hd">
      <div class="num">
        <span
          >在线设备：<i>{{ dStatus.normal }}</i></span
        >
        <span
          >离线设备：<i class="off">{{ dStatus.offline }}</i></span
        >
        <span
          >报警设备：<i class="warn">{{ dStatus.fault }}</i></span
        >
      </div>
      <div class="right">
        <van-button type="primary" size="small" @click="openSearch">筛选</van-button>
      </div>
    </div>
    <div class="tab-inner">
      <List :listType="1" :total="total1" ref="listRef1" @openDetail="openDetail" :list="list" @onLoad="onLoad" @onRefresh="onRefresh"> </List>
    </div>
    <van-popup v-model:show="show" position="right" :style="{ width: '78%', height: '100%' }">
      <div class="s-hd">
        筛选
        <van-icon name="cross" @click="show = false" />
      </div>
      <div class="search-box">
        <van-field
          label-align="top"
          style="padding: 0"
          v-model="queryParams.departName"
          readonly
          @click="orgShow = true"
          label="所属机构"
          placeholder="请选择"
        />
        <span>功能类别</span>
        <div class="item type">
          <van-button
            v-for="item in dList"
            @click="dTypeClick(item, 'deviceFunctionCode')"
            size="small"
            :key="item.key"
            :type="queryParams.deviceFunctionCode == item.key ? 'primary' : 'default'"
            >{{ item.title }}</van-button
          >
        </div>
        <span>系统分类</span>
        <div class="item type">
          <van-button
            v-for="item in sysType"
            @click="dTypeClick(item, 'deviceCategoryId')"
            size="small"
            :key="item.key"
            :type="queryParams.deviceCategoryId == item.key ? 'primary' : 'default'"
            >{{ item.title }}</van-button
          >
        </div>
        <span>设备状态</span>
        <div class="item type">
          <van-button
            v-for="item in deviceStatus"
            @click="dTypeClick(item, 'deviceStatus')"
            size="small"
            :key="item.key"
            :type="queryParams.deviceStatus == item.value ? 'primary' : 'default'"
            >{{ item.title }}</van-button
          >
        </div>

        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <CurLoading v-if="loading" />
    <van-popup v-model:show="orgShow" position="bottom">
      <van-picker :columns="orgList" :columns-field-names="customFieldName" @cancel="orgShow = false" @confirm="onConfirm" />
    </van-popup>
  </div>
</template>
<script lang="ts" setup name="AppDetecrionOnline">
import { getLoginUserOrg } from '../../hazardousOperation/api/index';
import { listDeviceFunctionTab, energyRegionDeviceListViewNew, deviceStatusStats, getDepartTreeBy23, listDeviceCategoryTree } from './index.api';
import CurLoading from '../components/loading.vue';
import { ref, nextTick, reactive, onMounted, onUnmounted } from 'vue';
import { setAppTitle } from '/@/utils/index';
import List from './components/list.vue';
import { useRouter } from 'vue-router';
import { getDictItemsByCode } from '/@/utils/dict';

const dStatus = ref<any>({});
const orgList = ref<any[]>([]);
const orgShow = ref(false);
const customFieldName = {
  text: 'departName',
  value: 'orgCode',
  children: 'children',
};

setAppTitle();
//按钮权限问题
const router = useRouter();
const list = ref<any[]>([]);
const loading = ref(true);
const applicantUnit = ref([]);

const queryParams = reactive<{
  pageNo: number;
  pageSize: number;
  orgCode: string;
  deviceCategoryId: string;
  deviceStatus: string;
  deviceFunctionCode: '';
  departName?: string;
}>({
  orgCode: '',
  deviceCategoryId: '',
  deviceStatus: '',
  deviceFunctionCode: '',
  pageNo: 1,
  pageSize: 10,
});
const dList = ref<any[]>([]);
const sysType = ref<any[]>([]); // 系统分类
const deviceStatus = ref<any[]>([]); // 设备状态
pageInit();
async function pageInit() {
  dList.value = await listDeviceFunctionTab();
  orgList.value = await getDepartTreeBy23();
  sysType.value = await listDeviceCategoryTree({});
  deviceStatus.value = await getDictItemsByCode('device_status');
  console.log(deviceStatus.value);
}

getLoginUserOrg().then((res) => {
  applicantUnit.value.push(...(res as never[]));
  if (res.length == 1) {
    queryParams.applicationUnit = res[0].orgCode;
    queryParams.applicationUnitText = res[0].departName;
  }
});

const listRef1 = ref();
const total1 = ref(0);

const show = ref(false);

const onRefresh = async (params) => {
  const res = await getList(params);
  loading.value = false;
  list.value = res.records;
  total1.value = res.total;
  nextTick(() => {
    listRef1.value.refreshEnd();
  });
};
const timer = ref<any>(null);
onMounted(() => {
  timer.value = setInterval(() => {
    console.log(queryParams);
    // onLoad(queryParams);
    getDeviceStatus();
  }, 15000);
});
// //在页面销毁之前先销毁定时器
onUnmounted(() => {
  clearInterval(timer.value);
});

const onLoad = async (params) => {
  const res = await getList(params);
  loading.value = false;
  list.value = [...list.value, ...res.records];
  total1.value = res.total;
  nextTick(() => {
    listRef1.value.loadEnd();
  });
};

const searchClick = () => {
  show.value = false;
  loading.value = true;
  onRefresh(queryParams);
  getDeviceStatus();
};
getDeviceStatus();

function getDeviceStatus() {
  deviceStatusStats(queryParams).then((res) => {
    res.forEach((item) => {
      if (item.name == '正常') dStatus.value.normal = item.value;
      if (item.name == '离线') dStatus.value.offline = item.value;
      if (item.name == '报警') dStatus.value.fault = item.value;
    });
  });
}
// 功能类别选择
const dTypeClick = (item, key) => {
  console.log(item);
  if (key == 'deviceStatus') {
    queryParams[key] = item.value;
  } else {
    queryParams[key] = item.key;
  }
};

// 首次加载列表
onLoad({});
function getList(params?) {
  return energyRegionDeviceListViewNew({ ...queryParams, ...params });
}

function reset() {
  Object.assign(queryParams, {
    orgCode: '',
    deviceCategoryId: '',
    deviceStatus: '',
    deviceFunctionCode: '',
    pageNo: 1,
    pageSize: 10,
  });
  show.value = false;
  onRefresh({});
}

// 卡片跳转
const openDetail = (item) => {
  console.log(item);
  let url = `/app/detecrionOnlineDetail`;

  router.push({ path: url, query: item });
};

const openSearch = () => {
  show.value = true;
};

const onConfirm = (e) => {
  console.log('onConfirm', e);
  if (e.selectedValues.length > 0) {
    if (e.selectedValues[1]) {
      queryParams.orgCode = e.selectedValues[1];
      queryParams.departName = e.selectedOptions[0].departName + '-' + e.selectedOptions[1].departName;
    } else {
      queryParams.orgCode = e.selectedValues[0];
      if (e.selectedOptions[1] && e.selectedOptions[1].departName == '全部') {
        queryParams.departName = e.selectedOptions[0].departName + '-' + e.selectedOptions[1].departName;
      } else {
        queryParams.departName = e.selectedOptions[0].departName;
      }
    }
  }
  orgShow.value = false;
};
</script>

<style lang="less" scoped>
.hiddendanger {
  width: 100%;
  height: 100%;
  background-color: #eff1f5;
  display: flex;
  flex-direction: column;

  .tab-inner {
    height: calc(100vh - 55px);
    overflow-y: scroll;
    background: #eff1f5;
    padding: 10px 15px;
  }

  .hd {
    width: 100%;
    height: 55px;
    padding: 0 15px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    // background-color: #ffffff;

    .num {
      flex: 1;
      font-size: 12px;
      display: flex;
      justify-content: space-around;

      i {
        font-style: normal;
        color: #3377f3;
      }

      .off {
        color: rgba(0, 0, 0, 0.38);
      }

      .warn {
        color: #ff9900;
      }
    }

    .right {
      width: auto;
      display: flex;
      align-items: center;
      justify-content: flex-end;

      .search-btn {
        color: #1989fa;
      }
    }

    .filter-btn {
      margin-left: 10px;

      img {
        width: 25px;
        height: 25px;
      }
    }

    .van-cell {
      padding: 3px !important;
    }
  }
}

.foot {
  height: 55px;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: space-around;
}

.s-hd {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  padding-bottom: 0;
}

.search-box {
  padding: 15px;
  > span {
    display: inline-block;
    font-weight: 600;
    margin: 10px 0;
  }
  .item {
    button {
      width: 110px;
    }
    div {
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }
}
.type {
  button {
    margin-left: 15px;
    margin-bottom: 10px;
  }
}
</style>
