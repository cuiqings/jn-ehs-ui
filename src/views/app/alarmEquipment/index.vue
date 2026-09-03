<!-- 设备报警管理 -->
<template>
  <div class="hiddendanger">
    <van-tabs v-model:active="queryParams.enableFlag" @change="tabChange">
      <van-tab title="已启用" :name="0">
        <div class="search-box">
          <van-button size="small" @click="checkDialogShow = true" :disabled="checkedIds.length == 0" type="primary">禁用</van-button>
          <van-button size="small" type="default" @click="openSearch">筛选</van-button>
        </div>
        <div class="tab-inner">
          <List
            :total="total1"
            ref="listRef1"
            :showBatch="showBatch"
            @checkChange="checkChange"
            @openDetail="edit"
            :list="list1"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="已禁用" :name="1">
        <div class="search-box">
          <van-button size="small" @click="checkDialogShow = true" :disabled="checkedIds.length == 0" type="primary">启用</van-button>
          <van-button size="small" type="default" @click="openSearch">筛选</van-button>
        </div>
        <div class="tab-inner">
          <List
            :showBatch="showBatch"
            @checkChange="checkChange"
            :total="total2"
            ref="listRef2"
            btnShowTag="canRepair"
            @openDetail="edit"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
    </van-tabs>
  </div>
  <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '65%' }">
    <div class="search-box">
      <div class="hd">
        <span>筛选</span>
        <van-icon @click="searchPopup = false" name="cross" />
      </div>
      <van-field label-align="top" v-model="queryParams.departName" readonly @click="orgShow = true" label="所属机构" placeholder="请选择" />
      <van-field v-model="queryParams.deviceName" label-align="top" name="repairDate" label="设备名称" placeholder="请输入" />
      <div class="foot">
        <van-button size="small" @click="reset">重置</van-button>
        <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
      </div>
    </div>
  </van-popup>
  <checkDialog v-model:show="checkDialogShow" :items="checkedIds" @checkSubmit="checkSubmit" :title="queryParams.enableFlag == 0 ? '禁用' : '启用'" />

  <van-popup v-model:show="orgShow" position="bottom">
    <van-picker :columns="orgList" :columns-field-names="customFieldName" @cancel="orgShow = false" @confirm="onConfirm" />
  </van-popup>
</template>
<script lang="ts" setup>
  import { getDepart2List, getList, specialCheckList, saveBatchCheckDate } from './index.api';
  import { getOrgCodeList, getDepartmentList } from '/@/api/common/api';
  import { ref, nextTick, computed, watch } from 'vue';
  import { useAppStore } from '/@/store/modules/app';
  import { useRouter, useRoute } from 'vue-router';
  import checkDialog from './components/checkDialog.vue';
  import List from './components/list.vue';
  import { showToast } from 'vant';
  import dayjs from 'dayjs';
import { status } from 'nprogress';

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);

  const router = useRouter();
  const route = useRoute();

  const checkDialogShow = ref(false);

  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref(0);
  const queryParams = ref({
    enableFlag: 0,
    orgCode: '',
    departName: '',
    deviceName: '',
    pageNo: pageNo.value,
    pageSize: pageSize.value
  });

  const onClickButton = () => {
    onRefresh({});
  };

  const orgList = ref<any[]>([]);
  const curOrgValue = ref('');
  const orgShow = ref(false);
  pageInit();
  async function pageInit() {
    orgList.value = await getOrgCodeList();
    orgList.value.forEach(async (item) => {
      item.text = item.departName
      item.children = await getDepartmentList({orgCode: item.orgCode});
    })
  }

  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };

  const listRef1 = ref();
  const listRef2 = ref();
  const total1 = ref(0);
  const total2 = ref(0);
  const list1 = ref<any[]>([]);
  const list2 = ref<any[]>([]);

  const onRefresh = async (params) => {
    const res = await requestList(params).catch(() => {
      queryParams.value.enableFlag == 0 ? listRef1.value.refreshEnd() : queryParams.value.enableFlag == 1 ? listRef2.value.refreshEnd() : '';
    });
    if (queryParams.value.enableFlag == 0) {
      list1.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    }
    if (queryParams.value.enableFlag == 1) {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    }
  };

  const checkSubmit = () => {
    onRefresh({})
  }

  const tabChange = (e) => {
    resetCheck(e);
    checkedIds.value = [];
    onRefresh({});
    // if (e == 0 && list1.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == 1 && list2.value.length == 0) {
    //   onRefresh({});
    // }
  };

  function resetCheck(s) {
    if(checkedIds.value.length > 0){
      if(s == 0){
        list2.value.forEach((item) => {
          item.checked = false;
        })
      }else{
        list1.value.forEach((item) => {
          item.checked = false;
        })
      }
    }

  }

  const typeActive = ref();
  const typeClick = (item) => {
    typeActive.value = item;
    queryParams.value.checkType = item;
  };

  const searchClick = () => {
    onRefresh({});
    searchPopup.value = false;
  };

  const onConfirm = (e) => {
    if(e.selectedOptions.length > 1){
      queryParams.value.orgCode = e.selectedValues[1];
      queryParams.value.departName = e.selectedOptions[0].departName + '-' + e.selectedOptions[1].departName;
    } else {
      queryParams.value.orgCode = e.selectedValues[0];
      queryParams.value.departName = e.selectedOptions[0].departName;
    }
    orgShow.value = false;
  };

  const reset = () => {
    queryParams.value = {
      enableFlag: queryParams.value.enableFlag,
      orgCode: '',
      departName: '',
      deviceName: '',
      pageNo: 1,
      pageSize: pageSize.value
    };
    if (queryParams.value.enableFlag == 0) {
      listRef1.value.onRefresh();
    }
    if (queryParams.value.enableFlag == 1) {
      listRef2.value.onRefresh();
    }
    searchPopup.value = false;
  };

  const onLoad = async (params) => {
    if (queryParams.value.enableFlag == 0) {
      const res = await requestList(params).catch(() => listRef1.value.loadEnd());
      list1.value = [...list1.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else if (queryParams.value.enableFlag == 1) {
      const res = await requestList(params).catch(() => listRef2.value.loadEnd());
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    }
  };
  nextTick(() => onRefresh({}));

  async function requestList(params?) {
    let res = await getList({
      ...queryParams.value,
      ...params,
    });
    if(res.length > 0){
      res.forEach((item) => {
        item.checked = false;
      })
    }
    return res;
  }

  const showBatch = ref(true);

  const checkedIds = ref<any[]>([]);

  const checkChange = (val) => {
    if (val.checked) {
      checkedIds.value.push(val);
    } else {
      let idx = 0;
      checkedIds.value.forEach((item, index) => {
        if (item.deviceId == val.deviceId) {
          idx = index;
        }
      });
      checkedIds.value.splice(idx, 1);
    }
  };

  // 搜索框
  const searchPopup = ref<boolean>(false);
  const showPicker = ref<boolean>(false);

  const orgTree = ref<{ orgCode: string; departName: string }[]>([]);
  getDepart2List({}).then((res) => {
    orgTree.value = res;
  });
  const openSearch = () => {
    searchPopup.value = true;
  };

  watch(
    () => router,
    (n) => {
      active.value = activeIdx.value + '';
    },
    { immediate: true, deep: true }
  );

  const edit = (item) => {
    let path = '/app/alarmEquipmentDetail';
    appStore.setActiveIdx(active.value);
    router.push({
      path,
      query: item,
    });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;

    .tab-inner {
      height: calc(100vh - 89px);
      overflow-y: scroll;
      background: #eff1f5;
      padding: 10px 15px;
    }

    .search-box {
      width: 100%;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }

  .search-box {
    .van-button {
      width: 48%;
    }

    .foot {
      padding: 0 10px;
      display: flex;
      margin-top: 30px;
      justify-content: space-between;
    }

    .hd {
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
    }

    .btns {
      padding: 10px 16px;

      p {
        margin-bottom: 10px;
      }

      ul li {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
      }
    }
  }
  .btn-wrap {
    button {
      margin-bottom: 10px;
      padding: 0 5px;
    }
  }
</style>
