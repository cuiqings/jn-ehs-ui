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
        :listType="2"
        :total="total4"
        ref="listRef"
        :isLast="true"
        :needBtn="false"
        @openDetail="edit($event, 'detail')"
        :immediateCheck="false"
        :list="list"
        @onLoad="onLoad"
        @onRefresh="onRefresh"
      />
    </div>
    <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '70%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="searchPopup = false" name="cross" />
        </div>

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
        <van-field v-model="queryParams.yhDescription" label-align="top" name="yhDescription" label="隐患名称（描述）" placeholder="请输入" />
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
  </div>
</template>
<script lang="ts" setup>
  import { accountList } from '../index.api';
  import { dateFormat } from '/@/utils/common/compUtils';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { ref, nextTick } from 'vue';
  import { useAppStore } from '/@/store/modules/app';
  import { useRouter, useRoute } from 'vue-router';
  import List from '../components/list.vue';
  import { showToast } from 'vant';
  const getPopupContainer = () => document.body;
  const appStore = useAppStore();

  const router = useRouter();
  const route = useRoute();
  const pageNo = ref(1);
  const pageSize = ref(10);
  const active = ref('1');

  const listRef = ref();
  const total4 = ref(0);
  const list = ref<any[]>([]);

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
    const res = await getList(params).catch(() => listRef.value.refreshEnd());
    list.value = res.records;
    total4.value = res.total;
    nextTick(() => {
      listRef.value.refreshEnd();
    });
  };

  const onLoad = async (params) => {
    const res = await getList({ ...params, ...queryParams.value }).catch(() => listRef.value.loadEnd());
    list.value = [...list.value, ...res.records];
    total4.value = res.total;
    nextTick(() => {
      listRef.value.loadEnd();
    });
  };

  function getList(params?) {
    return accountList({
      pageNo: pageNo.value,
      pageSize: pageSize.value,
      ...params,
    });
  }

  const showPicker = ref(false);
  const customFieldName = {
    text: 'departName',
    value: 'orgCode',
    children: 'children',
  };
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
    };
  };

  const searchClick = () => {
    pageNo.value = 1;
    searchPopup.value = false;
    onRefresh(queryParams.value);
  };

  const edit = (item, pageType) => {
    console.log(item, pageType);
    router.push({
      path: '/app/hiddenManage/deal',
      query: { id: item.id, pageType: pageType },
    });
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
      margin-top: 50px;
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
