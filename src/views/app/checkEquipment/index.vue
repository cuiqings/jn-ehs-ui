<!-- 设备检验 -->
<template>
  <div class="hiddendanger">
    <van-search v-model="queryParams.deviceName" show-action placeholder="请输入设备名称查询">
      <template #action>
        <div class="right">
          <div class="search-btn" @click="onClickButton">搜索</div>
          <div class="filter-btn" @click="openSearch">
            <img src="../../../assets/images/app/hazardous/filter.png" />
          </div>
        </div>
      </template>
    </van-search>
    <van-tabs v-model:active="queryParams.remindStatus" @change="tabChange">
      <van-tab title="全部" name="">
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
      <van-tab title="即将到期" name="2">
        <div class="tab-inner">
          <List :total="total2" ref="listRef2" btnShowTag="canRepair" @openDetail="edit" :list="list2" @onLoad="onLoad" @onRefresh="onRefresh" />
        </div>
      </van-tab>
      <van-tab title="超期未检" name="3">
        <div class="tab-inner">
          <List :total="total3" ref="listRef3" btnShowTag="canCheck" @openDetail="edit" :list="list3" @onLoad="onLoad" @onRefresh="onRefresh" />
        </div>
      </van-tab>
    </van-tabs>
    <div class="foot">
      <span class="tag-num" v-if="showBatch">已选（{{ checkedIds.length }}）</span>
      <van-button @click="showBatchClick" v-if="!showBatch" round type="primary" size="small">批量检验</van-button>
      <van-button @click="showBatch = false" v-if="showBatch" round size="small">取消</van-button>
      <van-button @click="subBatchClick" v-if="showBatch" round type="primary" size="small">批量检验</van-button>
    </div>
    <CheckDialog @hideBatch="hideBatchClick" :ids="checkedIds" v-model:show="checkDialogShow" />

    <van-calendar :minDate="new Date(20200101)" allow-same-day v-model:show="searchCalendarShow" type="range" @confirm="searchCalendarConfirm" />
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns-field-names="customFieldName" :columns="orgTree" @confirm="onConfirm" @cancel="showPicker = false" />
    </van-popup>
  </div>
  <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '65%' }">
    <div class="search-box">
      <div class="hd">
        <span>筛选</span>
        <van-icon @click="searchPopup = false" name="cross" />
      </div>

      <van-field
        v-model="queryParams.useDepartmentCodeName"
        is-link
        readonly
        label-align="top"
        name="useDepartmentCodeName"
        label="使用单位"
        placeholder="请选择"
        :disabled="orgTree.length == 1"
        @click="canShowPicker"
      />

      <div class="btns">
        <p>检验类型</p>
        <div class="btn-wrap">
          <van-button
            @click="typeClick(item.value)"
            v-for="item in deviceList"
            :key="item.value"
            size="small"
            round
            :type="typeActive == item.value ? 'primary' : 'default'"
          >
            {{ item.text }}</van-button
          >
        </div>
      </div>

      <van-field
        v-model="queryParams.date"
        readonly
        label-align="top"
        name="repairDate"
        label="下次检验时间"
        placeholder="请选择"
        @click="searchCalendarShow = true"
      />
      <div class="foot">
        <van-button size="small" @click="reset">重置</van-button>
        <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
      </div>
    </div>
  </van-popup>
  <loading v-show="loadingShow"></loading>
</template>
<script lang="ts" setup>
  import { getDepartTreeBy23, specialCheckList, saveBatchCheckDate } from './index.api';
  import CheckDialog from './components/checkDialog.vue';
  import { ref, nextTick, computed, watch, onMounted } from 'vue';
  import { useAppStore } from '/@/store/modules/app';
  import { useRouter, useRoute } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  import List from './components/list.vue';
  import dayjs, { Dayjs } from 'dayjs';
  import { showToast } from 'vant';
  import loading from '../components/loading.vue';

  setAppTitle('设备检验');

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);

  const router = useRouter();
  const loadingShow = ref(false);
  const deviceList = ref([
    { text: '消防器材', value: '6' },
    { text: '起重机械', value: '1' },
    { text: '叉车', value: '2' },
    { text: '压力容器', value: '3' },
    { text: '锅炉', value: '5' },
    { text: '安全阀', value: '4' },
  ]);

  const checkDialogShow = ref(false);

  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');
  const queryParams = ref({
    useDepartmentCodeName: '',
    date: '',
    checkType: '',
    deviceName: '',
    useDepartmentCode: '',
    remindStatus: activeIdx.value,
    pageNo: pageNo.value,
    pageSize: pageSize.value,
    startNextCheckDate: '',
    endNextCheckDate: '',
  });

  const onClickButton = () => {
    onRefresh({});
  };

  const listRef1 = ref();
  const listRef2 = ref();
  const listRef3 = ref();
  const total1 = ref(0);
  const total2 = ref(0);
  const total3 = ref(0);
  const list1 = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  onMounted(() => {
    if (Object.keys(appStore.getQueryParams).length) {
      Object.keys(queryParams.value).forEach((key) => {
        queryParams.value[key] = appStore.getQueryParams[key];
      });
      typeActive.value = queryParams.value.checkType;
      appStore.setQueryParams({});
    }
  });
  const onRefresh = async (params) => {
    const res = await getList(params).catch(() => {
      queryParams.value.remindStatus == ''
        ? listRef1.value.refreshEnd()
        : queryParams.value.remindStatus == '1'
        ? listRef2.value.refreshEnd()
        : queryParams.value.remindStatus == '2'
        ? listRef3.value.refreshEnd()
        : '';
    });
    if (queryParams.value.remindStatus == '') {
      list1.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    }
    if (queryParams.value.remindStatus == '2') {
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    }
    if (queryParams.value.remindStatus == '3') {
      list3.value = res.records;
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.refreshEnd();
      });
    }
  };

  const tabChange = (e) => {
    onRefresh({});
    // if (e == '1' && list1.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == '2' && list2.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == '3' && list3.value.length == 0) {
    //   onRefresh({});
    // }
  };

  const canShowPicker = () => {
    if (orgTree.value.length == 1 && orgTree.value[0].children && orgTree.value[0].children.length == 0) return;
    if (orgTree.value.length == 1 && !orgTree.value[0].children) return;
    showPicker.value = true;
  };

  const typeActive = ref();
  const typeClick = (item) => {
    typeActive.value = item;
    queryParams.value.checkType = item;
  };

  const searchClick = () => {
    onRefresh({});
    searchPopup.value = false;
  };

  // if (Object.keys(appStore.getQueryParams).length) {
  //   queryParams.value.checkType = appStore.getQueryParams?.checkType;
  //   typeActive.value = queryParams.value.checkType;
  //   queryParams.value.startNextCheckDate = appStore.getQueryParams?.startNextCheckDate;
  //   queryParams.value.endNextCheckDate = appStore.getQueryParams?.endNextCheckDate;
  //   queryParams.value.date = queryParams.value.startNextCheckDate
  //     ? queryParams.value.startNextCheckDate + '~' + queryParams.value.endNextCheckDate
  //     : '';
  //   appStore.setQueryParams({});
  // }

  const onConfirm = (e) => {
    if (e.selectedOptions.length > 1 && e.selectedOptions[1]) {
      if (e.selectedOptions[1].departName == '全部') {
        queryParams.value.useDepartmentCode = e.selectedValues[0];
        queryParams.value.useDepartmentCodeName = e.selectedOptions[0].departName;
      } else {
        queryParams.value.useDepartmentCode = e.selectedValues[1];
        queryParams.value.useDepartmentCodeName = e.selectedOptions[0].departName + '-' + e.selectedOptions[1].departName;
      }
    } else {
      queryParams.value.useDepartmentCode = e.selectedValues[0];
      queryParams.value.useDepartmentCodeName = e.selectedOptions[0].departName;
    }
    showPicker.value = false;
  };

  const reset = () => {
    queryParams.value = {
      useDepartmentCodeName: '',
      date: '',
      checkType: '',
      deviceName: '',
      useDepartmentCode: '',
      remindStatus: '',
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      startNextCheckDate: '',
      endNextCheckDate: '',
    };
    typeActive.value = 0;
    if (orgTree.value.length == 1) {
      queryParams.value.useDepartmentCodeName = orgTree.value[0].departName;
      queryParams.value.useDepartmentCode = orgTree.value[0].orgCode;
    }
    // if (queryParams.value.remindStatus == '') {
    //   listRef1.value.onRefresh();
    // }
    // if (queryParams.value.remindStatus == '2') {
    //   listRef2.value.onRefresh();
    // }
    // if (queryParams.value.remindStatus == '3') {
    //   listRef3.value.onRefresh();
    // }
    // searchPopup.value = false;
  };

  const onLoad = async (params) => {
    if (queryParams.value.remindStatus == '') {
      const res = await getList(params).catch(() => listRef1.value.loadEnd());
      if (res) {
        list1.value = [...list1.value, ...res.records];
        total1.value = res.total;
      }
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else if (queryParams.value.remindStatus == '2') {
      const res = await getList(params).catch(() => listRef2.value.loadEnd());
      if (res) {
        list2.value = [...list2.value, ...res.records];
        total2.value = res.total;
      }
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    } else if (queryParams.value.remindStatus == '3') {
      const res = await getList(params).catch(() => listRef3.value.loadEnd());
      if (res) {
        list3.value = [...list3.value, ...res.records];
        total3.value = res.total;
      }
      nextTick(() => {
        listRef3.value.loadEnd();
      });
    }
  };

  function setCheckedFild(val) {
    list1.value.forEach((item) => {
      item.checked = val;
    });
    list2.value.forEach((item) => {
      item.checked = val;
    });
    list3.value.forEach((item) => {
      item.checked = val;
    });
  }
  function getList(params?) {
    // loadingShow.value = true;
    return new Promise((resolve, reject) => {
      specialCheckList({
        ...queryParams.value,
        ...params,
      })
        .then((res) => {
          resolve(res);
          loadingShow.value = false;
        })
        .catch((err) => {
          loadingShow.value = true;
          reject(err);
        });
    });
  }

  const showBatch = ref(false);
  const showBatchClick = () => {
    setCheckedFild(false);
    showBatch.value = true;
  };

  const hideBatchClick = (formData) => {
    if (formData.nextCheckDate) {
      formData.nextCheckDate += ' 00:00:00';
    }
    saveBatchCheckDate({
      checkVos: checkedIds.value,
      ...formData,
    }).then((res) => {
      // showToast('批量检验成功！');
      setCheckedFild(false);
      showBatch.value = false;
      checkedIds.value = [];
      if (queryParams.value.remindStatus == '') {
        listRef1.value.onRefresh();
      }
      if (queryParams.value.remindStatus == '2') {
        listRef2.value.onRefresh();
      }
      if (queryParams.value.remindStatus == '3') {
        listRef3.value.onRefresh();
      }
    });
  };

  const subBatchClick = () => {
    if (checkedIds.value.length == 0) {
      showToast('请选择检验设备！');
      return;
    }
    checkDialogShow.value = true;
  };
  const checkedIds = ref<any[]>([]);

  const checkChange = (val) => {
    if (val.checked) {
      checkedIds.value.push({ id: val.id, checkType: val.checkType });
    } else {
      checkedIds.value.splice(checkedIds.value.indexOf(val.id), 1);
    }
  };

  // 搜索框
  const searchPopup = ref<boolean>(false);
  const showPicker = ref<boolean>(false);
  const searchCalendarShow = ref<boolean>(false);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };
  const orgTree = ref<{ orgCode: string; departName: string }[]>([]);

  getDepartTreeBy23().then((res) => {
    res.forEach((val) => {
      if (!val.children) {
        val.children = [];
      } else if (val.children.length > 1) {
        val.children.unshift({
          orgCode: '',
          departName: '全部',
        });
      }
    });
    orgTree.value = res;
    if (orgTree.value.length == 1) {
      queryParams.value.useDepartmentCodeName = res[0].departName;
      queryParams.value.useDepartmentCode = res[0].orgCode;
    }
    nextTick(() => onRefresh({}));
  });
  const openSearch = () => {
    searchPopup.value = true;
  };

  const searchCalendarConfirm = (e) => {
    queryParams.value.date = dayjs(e[0]).format('YYYY-MM-DD') + '~' + dayjs(e[1]).format('YYYY-MM-DD');
    queryParams.value.startNextCheckDate = dayjs(e[0]).format('YYYY-MM-DD') + ' 00:00:00';
    queryParams.value.endNextCheckDate = dayjs(e[1]).format('YYYY-MM-DD') + ' 23:59:59';
    searchCalendarShow.value = false;
  };

  watch(
    () => router,
    (n) => {
      queryParams.value.remindStatus = activeIdx.value;
    },
    { immediate: true, deep: true }
  );

  const edit = (item) => {
    let path = '/app/checkEquipment/detail';
    appStore.setActiveIdx(queryParams.value.remindStatus);
    appStore.setQueryParams(queryParams.value);
    router.push({
      path,
      query: { id: item.id, checkType: item.checkType, remindStatus: item.remindStatus },
    });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;

    .tab-inner {
      height: calc(100vh - 146px);
      overflow-y: scroll;
      background: #eff1f5;
      padding: 10px 15px;
    }

    .add-btn {
      position: fixed;
      bottom: 30px;
      right: 25px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 50px;
      background-color: #1989fa;
      border-radius: 50%;
    }

    .add {
      width: 36px;
      height: 36px;
      transform: translateY(-2px);
    }

    .foot {
      padding: 8px 0;
      display: flex;
      justify-content: center;
      position: relative;
      .van-button {
        width: 100px;
        margin-right: 15px;
      }
      .tag-num {
        font-size: 12px;
        position: absolute;
        left: 15px;
        top: 50%;
        transform: translateY(-50%);
      }
    }

    .right {
      width: 70px;
      display: flex;
      align-items: center;
      justify-content: space-around;

      img {
        width: 25px;
        height: 22px;
      }

      .search-btn {
        color: #1989fa;
      }
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
      font-weight: 600;
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
