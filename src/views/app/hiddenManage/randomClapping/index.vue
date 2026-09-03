<template>
  <div class="hiddendanger">
    <van-floating-bubble axis="xy" :gap="10" v-model:offset="offset" class="mybubble">
      <template #default>
        <span class="content" @click="searchPopup = true">
          <van-icon style="transform: translateY(0px)" name="filter-o" size="14" />
          搜索
        </span>
      </template>
    </van-floating-bubble>

    <div class="tab-inner">
      <List
        :listType="1"
        :total="total4"
        ref="listRef4"
        :isLast="true"
        @openDetail="goDetail"
        :immediateCheck="false"
        @edit="edit"
        @exchange="exchange"
        @editItem="onEditItem"
        @deleteItem="onDeleteItem"
        :list="list4"
        @onLoad="onLoad"
        @onRefresh="onRefresh"
        :needNotice="true"
      />
    </div>
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

        <van-field v-model="queryParams.yhDescription" label-align="top" name="yhDescription" label="隐患描述" placeholder="请输入" />

        <van-field
          readonly
          @click="openPicker('org')"
          v-model="queryParams.orgName"
          label-align="top"
          name="dutyOrgName"
          label="责任单位"
          placeholder="请选择"
          :disabled="orgList.length == 1"
        />

        <!-- <van-field
          readonly
          @click="showPicker2 = true"
          v-model="queryParams.departName"
          label-align="top"
          name="dutyDeptName"
          label="所属车间"
          placeholder="请选择"
        /> -->

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
            <span v-if="queryParams.checkTimeBegin">{{ queryParams.checkTimeBegin }}~{{ queryParams.checkTimeEnd }}</span>
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
      <van-picker :columns-field-names="customFieldName" :columns="orgList" @confirm="onConfirm($event, 'org')" @cancel="showPicker = false" />
    </van-popup>

    <van-popup v-model:show="showPicker2" position="bottom">
      <van-picker :columns-field-names="customFieldName" :columns="departList" @confirm="onConfirm($event, 'depart')" @cancel="showPicker2 = false" />
    </van-popup>

    <div class="add-btn" @click="toAdd">
      <img src="../../../../assets/images/app/hazardous/input.png" alt="" class="add" />
    </div>
  </div>
</template>
<script lang="ts" setup>
  import { accountList, changeRepairPerson, getAllUserByOrg, jnYhSspDelete } from '../index.api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { getDepartTreeBy23, getDepart3ListWithSecurity } from '/@/api/common/api';
  import { ref, nextTick, computed, watch } from 'vue';
  import { useAppStore } from '/@/store/modules/app';
  import { useRouter, useRoute } from 'vue-router';
  import List from '../components/list.vue';
  import { showToast, showConfirmDialog } from 'vant';
  const appStore = useAppStore();

  const router = useRouter();
  const route = useRoute();
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef4 = ref();
  const total4 = ref(0);
  const list4 = ref<any[]>([]);

  const offset = ref({ x: document.body.clientWidth - 75, y: 8 });
  const searchPopup = ref(false);
  const searchCalendarShow = ref(false);
  const dangerList = ref([
    { name: '一般', value: '1' },
    { name: '重大', value: '2' },
  ]);
  const gradeActive = ref();
  const typeActive = ref();
  const queryParams = ref({
    checkType: '2',
    dutyOrg: '',
    orgName: '',
    depart: '',
    departName: '',
    yhLevel: '',
    reportType: '',
    yhDescription: '',
    dutyDeptName: '',
    checkTimeBegin: '',
    checkTimeEnd: '',
    date: '',
  });

  const gradeClick = (e) => {
    gradeActive.value = e;
    queryParams.value.yhLevel = e;
  };
  const typeClick = (e) => {
    typeActive.value = e;
    queryParams.value.reportType = e;
  };

  const openPicker = (type) => {
    if (type === 'org') {
      if (orgList.value.length > 1) {
        showPicker.value = true;
      }
    }
  };

  const onRefresh = async (params) => {
    const res = await getList4(params).catch(() => listRef4.value.refreshEnd());
    list4.value = res.records;
    total4.value = res.total;
    nextTick(() => {
      listRef4.value.refreshEnd();
    });
  };

  const onLoad = async (params) => {
    const res = await getList4({ ...params, ...queryParams.value }).catch(() => listRef4.value.loadEnd());
    list4.value = [...list4.value, ...res.records];
    total4.value = res.total;
    nextTick(() => {
      listRef4.value.loadEnd();
    });
  };

  function getList4(params?) {
    return accountList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      checkType: '2',
      ...params,
    });
  }

  const showPicker = ref(false);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };
  const showPicker2 = ref(false);
  const departList = ref<any[]>([]);
  const orgList = ref<any[]>([]);
  const getOrgList = () => {
    getDepart3ListWithSecurity().then((res) => {
      orgList.value = res;
      if (orgList.value.length == 1) {
        queryParams.value.orgName = res[0].departName;
        queryParams.value.dutyOrg = res[0].orgCode;
      }
      nextTick(() => onRefresh({}));
    });
  };

  getOrgList();

  const onConfirm = (e, type) => {
    if (type == 'org') {
      queryParams.value.dutyOrg = e.selectedOptions[0].orgCode;
      queryParams.value.orgName = e.selectedOptions[0].departName;
      showPicker.value = false;
    } else {
      queryParams.value.depart = e.selectedOptions[0].orgCode;
      queryParams.value.departName = e.selectedOptions[0].departName;
      showPicker2.value = false;
    }
  };
  const searchCalendarConfirm = (e) => {
    queryParams.value.checkTimeBegin = dateFormat(e[0], 'yyyy-MM-dd');
    queryParams.value.checkTimeEnd = dateFormat(e[1], 'yyyy-MM-dd');
    searchCalendarShow.value = false;
    console.log(queryParams.value);
  };

  const reset = () => {
    queryParams.value = {
      checkType: '2',
      dutyOrg: '',
      orgName: '',
      depart: '',
      departName: '',
      yhLevel: '',
      reportType: '',
      yhDescription: '',
      dutyDeptName: '',
      checkTimeBegin: '',
      checkTimeEnd: '',
      date: '',
    };
  };

  const searchClick = () => {
    pageNo.value = 1;
    searchPopup.value = false;
    onRefresh(queryParams.value);
  };

  const toAdd = () => {
    appStore.setActiveIdx(active.value);
    router.push({ path: '/app/hiddenManage/randomClapping/add' });
  };

  /**
   *
   * @param item
   * @param tabIdx 1：隐患确认处理按钮，2：隐患确认卡片；3：隐患整改按钮，4：隐患整改卡片；5：隐患验收按钮，6：隐患验收卡片
   */
  const edit = (item) => {
    router.push({
      path: '/app/hiddenManage/deal',
      query: { id: item.id, pageType: 'deal', checkName: 'clapping' },
    });
  };

  const exchangeShow = ref(false);
  const repairPersonOptions = ref([]);
  const repairPerson = ref(undefined);
  const curExchangeItem = ref<any>({});
  const exchange = async (item) => {
    curExchangeItem.value = item;
    exchangeShow.value = !exchangeShow.value;
    let params: any = {};
    if (item.org) {
      params.orgCode = item.org;
    }
    params.pageSize = 9999;
    params.pageNo = 1;
    await getAllUserByOrg(params).then((res) => {
      if (res) {
        repairPersonOptions.value = res.map((item: any) => {
          return {
            label: item.realname,
            value: item.id,
          };
        });
      }
    });
  };
  const beforeexchangeClose = (s) => {
    return new Promise((resolve, reject) => {
      if (s == 'cancel') {
        exchangeShow.value = false;
        repairPerson.value = undefined;
        return Promise.resolve(true);
      }
      if (!repairPerson.value) {
        showToast('请选择整改人');
        return resolve(false);
      }

      changeRepairPerson({
        id: curExchangeItem.value.id,
        repairPerson: repairPerson.value,
      }).then((res) => {
        resolve(true);
        exchangeShow.value = false;
        repairPerson.value = undefined;
      });
    });
  };
  const dialogexchangeConfirm = () => {
    // exchangeShow.value = false;
  };
  const filterOption = (input: string, option: any) => {
    return option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0;
  };
  const goDetail = (item) => {
    appStore.setActiveIdx(active.value);
    let query = { id: item.id, pageType: 'detail', checkName: 'clapping' };
    router.push({
      path: '/app/hiddenManage/deal',
      query: query,
    });
  };

  /**
   * 编辑：跳转到同目录下的 add.vue 并携带当前项 id
   * @param item 当前列表项对象，需包含 id 字段
   */
  const onEditItem = (item) => {
    appStore.setActiveIdx(active.value);
    router.push({
      path: '/app/hiddenManage/randomClapping/add',
      query: { id: item.id },
    });
  };

  /**
   * 删除：弹出确认框，确认后调用删除接口并刷新列表
   * @param item 当前列表项对象，需包含 id 字段
   */
  const onDeleteItem = async (item) => {
    try {
      await showConfirmDialog({ title: '确认删除', message: '删除后不可恢复，是否继续？' });
      await jnYhSspDelete({ id: item.id, flag: '1' });
      showToast('删除成功');
      pageNo.value = 1;
      await onRefresh({});
    } catch (e) {
      // 用户取消或接口异常，忽略即可
    }
  };
</script>

<style lang="less" scoped>
  .hiddendanger {
    width: 100%;
    height: 100%;
    .tab-inner {
      height: 100%;
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
  .dialog-content {
    padding: 0 15px;
    display: flex;
    align-items: center;
    height: 100px;
    & > span {
      width: 80px;
      &::before {
        content: '* ';
        color: #ff4d4f;
      }
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
  .custom-ant-select {
    z-index: 9999 !important;
  }
</style>
