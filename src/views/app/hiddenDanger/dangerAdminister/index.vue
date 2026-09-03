<template>
  <div class="hiddendanger">
    <van-floating-bubble axis="xy" gap="10" v-model:offset="offset" class="mybubble">
      <template #default>
        <span class="content" @click="searchPopup = true">
          <van-icon style="transform: translateY(0px)" name="filter-o" size="14" />
          搜索
        </span>
      </template>
    </van-floating-bubble>
    <van-tabs v-model:active="active" @change="tabChange">
      <van-tab title="隐患确认" name="1">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total1"
            ref="listRef1"
            @openDetail="edit($event, 2)"
            @edit="edit($event, 1)"
            :list="list1"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="隐患整改" name="2">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total2"
            ref="listRef2"
            btnShowTag="canRepair"
            @openDetail="edit($event, 4)"
            btnText="整改反馈"
            @edit="edit($event, 3)"
            :list="list2"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="隐患验收" name="3">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total3"
            ref="listRef3"
            btnShowTag="canCheck"
            @openDetail="edit($event, 6)"
            btnText="验收审核"
            @edit="edit($event, 5)"
            :list="list3"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
          />
        </div>
      </van-tab>
      <van-tab title="隐患告知" name="4">
        <div class="tab-inner">
          <List
            :listType="2"
            :total="total4"
            ref="listRef4"
            :isLast="true"
            @openDetail="edit($event, 7)"
            :needBtn="false"
            @edit="edit($event, 7)"
            :list="list4"
            @onLoad="onLoad"
            @onRefresh="onRefresh"
            :needNotice="true"
          />
        </div>
      </van-tab>
    </van-tabs>
    <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '65%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="searchPopup = false" name="cross" />
        </div>

        <div class="btns">
          <p>隐患等级</p>
          <div class="btn-wrap">
            <van-button
              @click="gradeClick(item.value)"
              v-for="item in dangerList"
              :key="item.value"
              size="small"
              round
              :type="queryParams.yhLevel == item.value ? 'primary' : 'default'"
            >
              {{ item.name }}</van-button
            >
          </div>
        </div>
        <div class="btns">
          <p>提交方式</p>
          <div class="btn-wrap">
            <van-button
              @click="typeClick(item.value)"
              v-for="item in getDictItemsByCode('yh_report_type')"
              :key="item.value"
              size="small"
              round
              :type="queryParams.reportType == item.value ? 'primary' : 'default'"
            >
              {{ item.text }}</van-button
            >
          </div>
        </div>

        <van-field v-model="queryParams.yhDescription" label-align="top" name="yhDescription" label="隐患描述" placeholder="请输入" />

        <van-field v-model="queryParams.dutyDeptName" label-align="top" name="dutyDeptName" label="责任部门" placeholder="请输入" />

        <van-field
          v-model="queryParams.date"
          readonly
          label-align="top"
          name="date"
          label="提报时间"
          placeholder="请选择"
          @click="searchCalendarShow = true"
        >
          <template #input>
            <span v-if="queryParams.createTimeBegin">{{ queryParams.createTimeBegin }}~{{ queryParams.createTimeEnd }}</span>
            <span v-else style="color: #969799">请选择</span>
          </template>
        </van-field>
        <div class="foot">
          <van-button size="small" @click="reset">重置</van-button>
          <van-button size="small" @click="searchClick" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <van-calendar :minDate="new Date(20200101)" allow-same-day v-model:show="searchCalendarShow" type="range" @confirm="searchCalendarConfirm" />
    <van-popup v-model:show="showPicker" position="bottom">
      <van-picker :columns-field-names="customFieldName" :columns="orgTree" @confirm="onConfirm" @cancel="showPicker = false" />
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
  import { jnYhConfirmList, jnYhRepairLogList, jnYhConfirmCheckList, statisticsList } from '../index.api';
  import { getDictItemsByCode } from '/@/utils/dict/index';
  import { getDepartTreeBy23 } from '/@/api/common/api';
  import List from '../components/list.vue';
  import { useRouter, useRoute } from 'vue-router';
  import { ref, nextTick, computed, watch } from 'vue';
  import { useAppStore } from '/@/store/modules/app';
  import { dateFormat } from '/@/utils/common/compUtils';

  const appStore = useAppStore();
  const activeIdx = computed(() => appStore.getActiveIdx);

  const router = useRouter();
  const route = useRoute();
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef1 = ref();
  const listRef2 = ref();
  const listRef3 = ref();
  const listRef4 = ref();
  const total1 = ref(0);
  const total2 = ref(0);
  const total3 = ref(0);
  const total4 = ref(0);
  const list1 = ref<any[]>([]);
  const list2 = ref<any[]>([]);
  const list3 = ref<any[]>([]);
  const list4 = ref<any[]>([]);

  const offset = ref({ x: document.body.clientWidth - 75, y: 48 });
  const searchPopup = ref(false);
  const searchCalendarShow = ref(false);
  const dangerList = ref([
    { name: '一般', value: '1' },
    { name: '较大', value: '2' },
    { name: '重大', value: '3' },
  ]);
  const gradeActive = ref();
  const typeActive = ref();
  const queryParams = ref({
    yhLevel: '',
    reportType: '',
    yhDescription: '',
    dutyDeptName: '',
    createTimeBegin: '',
    createTimeEnd: '',
  });

  const gradeClick = (e) => {
    gradeActive.value = e;
    queryParams.value.yhLevel = e;
  };
  const typeClick = (e) => {
    typeActive.value = e;
    queryParams.value.reportType = e;
  };

  const onRefresh = async (params) => {
    if (active.value == '1') {
      const res = await getList1(params).catch(() => listRef1.value.refreshEnd());
      list1.value = res.records;
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.refreshEnd();
      });
    } else if (active.value == '2') {
      const res = await getList2(params).catch(() => listRef2.value.refreshEnd());
      list2.value = res.records;
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.refreshEnd();
      });
    } else if (active.value == '3') {
      const res = await getList3(params).catch(() => listRef3.value.refreshEnd());
      list3.value = res.records;
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.refreshEnd();
      });
    } else if (active.value == '4') {
      const res = await getList4(params).catch(() => listRef4.value.refreshEnd());
      list4.value = res.records;
      total4.value = res.total;
      nextTick(() => {
        listRef4.value.refreshEnd();
      });
    }
  };

  const tabChange = (e) => {
    // if (e == '1' && list1.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == '2' && list2.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == '3' && list3.value.length == 0) {
    //   onRefresh({});
    // }
    // if (e == '4' && list4.value.length == 0) {
    //   onRefresh({});
    // }
  };

  const onLoad = async (params) => {
    if (active.value == '1') {
      const res = await getList1({...params, ...queryParams.value}).catch(() => listRef1.value.loadEnd());
      list1.value = [...list1.value, ...res.records];
      total1.value = res.total;
      nextTick(() => {
        listRef1.value.loadEnd();
      });
    } else if (active.value == '2') {
      const res = await getList2({...params, ...queryParams.value}).catch(() => listRef2.value.loadEnd());
      list2.value = [...list2.value, ...res.records];
      total2.value = res.total;
      nextTick(() => {
        listRef2.value.loadEnd();
      });
    } else if (active.value == '3') {
      const res = await getList3({...params, ...queryParams.value}).catch(() => listRef3.value.loadEnd());
      list3.value = [...list3.value, ...res.records];
      total3.value = res.total;
      nextTick(() => {
        listRef3.value.loadEnd();
      });
    } else if (active.value == '4') {
      const res = await getList4({...params, ...queryParams.value}).catch(() => listRef4.value.loadEnd());
      list4.value = [...list4.value, ...res.records];
      total4.value = res.total;
      nextTick(() => {
        listRef4.value.loadEnd();
      });
    }
  };

  function getList1(params?) {
    return jnYhConfirmList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  function getList2(params?) {
    return jnYhRepairLogList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  function getList3(params?) {
    return jnYhConfirmCheckList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  function getList4(params?) {
    return statisticsList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

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
    // nextTick(() => onRefresh({}));
  });
  const showPicker = ref(false);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };
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
  const searchCalendarConfirm = (e) => {
    queryParams.value.createTimeBegin = dateFormat(e[0], 'yyyy-MM-dd');
    queryParams.value.createTimeEnd = dateFormat(e[1], 'yyyy-MM-dd');
    searchCalendarShow.value = false;
    console.log(queryParams.value);
  };

  const reset = () => {
    queryParams.value = {
      yhLevel: '',
      reportType: '',
      yhDescription: '',
      dutyDeptName: '',
      createTimeBegin: '',
      createTimeEnd: '',
    };
  };

  const searchClick = () => {
    pageNo.value = 1;
    searchPopup.value = false;
    onRefresh(queryParams.value);
    // if (active.value == '1') {
    //   listRef1.value.refreshFn();
    // }
    // if (active.value == '2') {
    //   listRef1.value.refreshFn();
    // }
    // if (active.value == '3') {
    //   listRef1.value.refreshFn();
    // }
    // if (active.value == '4') {
    //   listRef1.value.refreshFn();
    // }
  };

  watch(
    () => router,
    (n) => {
      active.value = activeIdx.value + '';
      console.log(active.value);
    },
    { immediate: true, deep: true }
  );

  /**
   *
   * @param item
   * @param tabIdx 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  const edit = (item, tabIdx) => {
    let path = '';
    if (tabIdx < 3) {
      path = '/app/hiddenDanger/dangerAdminister/edit';
    }
    if (tabIdx > 2 && tabIdx < 5) {
      path = '/app/hiddenDanger/dangerAdminister/checkDanger';
    }
    if (tabIdx == 6) {
      path = '/app/hiddenDanger/dangerAdminister/checkDanger';
    }
    if (tabIdx == 5) {
      path = '/app/hiddenDanger/dangerAdminister/checkAccept';
    }
    if (tabIdx == 7) {
      path = '/app/hiddenDanger/dangerAdminister/detail';
    }
    appStore.setActiveIdx(active.value);
    let query = { id: item.sourceId, sourceType: item.sourceType, pageType: tabIdx };
    if (item.hasOwnProperty('canHandle')) query.canHandle = item.canHandle;
    if (item.hasOwnProperty('canRepair') && [3, 4].includes(tabIdx)) query.canHandle = item.canRepair;
    if (item.hasOwnProperty('canRepair') && [5, 6].includes(tabIdx)) query.canHandle = item.canCheck;
    router.push({
      path,
      query: query,
    });
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    .tab-inner {
      height: calc(100vh - 44px);
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
<style lang="less">
  .mybubble {
    width: 65px !important;
    height: 35px !important;
    .content {
      font-size: 14px !important;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
</style>
