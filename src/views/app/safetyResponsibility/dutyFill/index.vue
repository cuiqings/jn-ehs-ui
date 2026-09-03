<template>
  <div class="ledger">
    <div v-if="datalist.length > 0">
      <van-floating-bubble axis="xy" :gap="8" v-model:offset="offset" class="mybubble">
        <template #default>
          <span class="content" @click="searchPopup = true">
            <van-icon style="transform: translateY(0px)" name="filter-o" size="14" />
            搜索
          </span>
        </template>
      </van-floating-bubble>
    </div>

    <div class="main">
      <List :total="total" ref="listRef" @onLoad="onLoad" @onRefresh="onRefresh" :list="datalist">
        <template #btn="{ item }">
          <div style="display: flex; justify-content: flex-end">
            <van-button v-if="item.status == '待审核'" style="margin-right: 10px" type="primary" @click.stop="fillClick(item)">填报</van-button>
            <van-button @click.stop="handleDetail(item)">查看</van-button>
          </div>
        </template>
      </List>
    </div>
    <van-popup v-model:show="searchPopup" position="right" :style="{ height: '100%', width: '65%' }">
      <div class="search-box">
        <div class="hd">
          <span>筛选</span>
          <van-icon @click="searchPopup = false" name="cross" />
        </div>
        <div class="btns">
          <p>类型</p>
          <div class="btn-wrap">
            <van-button
              @click="postTypeClick(item.value)"
              v-for="item in typeOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.postType == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <van-field
          label-align="top"
          v-model="queryParams.orgCodeName"
          readonly
          name="orgCodeName"
          label="所属单位："
          placeholder="请选择"
          @click="showPicker.orgCode = true"
        />

        <van-field
          label-align="top"
          v-model="queryParams.workshopName"
          readonly
          name="workshopName"
          label="所属车间："
          placeholder="请选择"
          @click="showPicker.workshop = true"
        />
        <van-field v-model="queryParams.post" label-align="top" name="post" label="岗位" placeholder="请输入" />
        <van-field v-model="queryParams.realName" label-align="top" name="realName" label="姓名" placeholder="请输入" />
        <!-- 履职结果选择 -->
        <div class="btns">
          <p>履职结果</p>
          <div class="btn-wrap">
            <van-button
              @click="resultClick(item.value)"
              v-for="item in resultOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.result == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <!-- 审核状态选择 -->
        <div class="btns">
          <p>审核状态</p>
          <div class="btn-wrap">
            <van-button
              @click="statusClick(item.value)"
              v-for="item in statusOptions"
              :key="item.value"
              size="small"
              round
              :type="queryParams.status == item.value ? 'primary' : 'default'"
            >
              {{ item.label }}</van-button
            >
          </div>
        </div>
        <div class="foot">
          <van-button size="small" @click="resetSearch">重置</van-button>
          <van-button size="small" @click="onSearch" type="primary">搜索</van-button>
        </div>
      </div>
    </van-popup>
    <!--所属单位-->
    <van-popup v-model:show="showPicker.orgCode" position="bottom">
      <van-picker
        :columns-field-names="{ text: 'departName', value: 'orgCode' }"
        :columns="selectList.orgCode"
        @cancel="showPicker.orgCode = false"
        @confirm="onConfirm($event, 'orgCode')"
      />
    </van-popup>

    <!--所属车间-->
    <van-popup v-model:show="showPicker.workshop" position="bottom">
      <van-picker
        :columns-field-names="{ text: 'departName', value: 'orgCode' }"
        :columns="selectList.workshop"
        @cancel="showPicker.workshop = false"
        @confirm="onConfirm($event, 'workshop')"
      />
    </van-popup>

    <!--状态：-->
    <van-popup v-model:show="showPicker.status" position="bottom">
      <van-picker :columns="selectList.status" @cancel="showPicker.status = false" @confirm="onConfirm($event, 'status')" />
    </van-popup>

    <!--检查结果：-->
    <van-popup v-model:show="showPicker.result" position="bottom">
      <van-picker :columns="selectList.result" @cancel="showPicker.result = false" @confirm="onConfirm($event, 'result')" />
    </van-popup>
  </div>
</template>
<script setup lang="ts">
  import { useDepartList } from '/@/views/hazardousOperation/hooks/useDepartList';
  import { getDepart3ListWithSecurity, selectDeptNew } from '/@/api/common/api';
  import { getList } from '/@/views/safetyResponsibility/dutyFill/dutyFill.api';
  import { orgOptions, departOptions, typeOptions, statusOptions, resultOptions } from '../dutyReview/dutyReview.data';
  import { ref, nextTick, onMounted } from 'vue';
  import List from './components/list.vue';
  import { useRouter } from 'vue-router';
  const listRef = ref<InstanceType<typeof List> | null>(null);
  const datalist = ref<any[]>([]);
  const total = ref(0);
  const pageSize = ref(10);
  const searchPopup = ref(false);
  const offset = ref({ x: document.body.clientWidth - 75, y: 8 });
  const name = ref('');
  const router = useRouter();
  const queryParams = ref<any>({
    orgCode: '',
    orgCodeName: '',
    workshop: '',
    workshopName: '',
    postType: '',
    post: '',
    realName: '',
    status: '',
    result: '',
    resultName: '',
  });
  const showPicker = ref({
    orgCode: false,
    workshop: false,
    status: false,
    result: false,
    postType: false,
  });
  const selectList = ref<any>({
    postType: [
      {
        text: '科段级及以上',
        value: '2',
      },
      {
        text: '科段级以下',
        value: '1',
      },
    ],
    orgCode: [],
    workshop: [],
    status: [
      {
        text: '待审核',
        value: '待审核',
      },
      {
        text: '审核通过',
        value: '审核通过',
      },
    ],
    result: [
      {
        text: '合格',
        value: '1',
      },
      {
        text: '基本合格',
        value: '2',
      },
      {
        text: '不合格',
        value: '0',
      },
    ],
  });

  const applicationUnitList = ref<any[]>([]);
  onMounted(async () => {
    const { applicationUnitList: list } = await useDepartList(9);
    applicationUnitList.value = list.value;
  });
  const isShowSearch = ref(false);
  const openSearch = () => {
    isShowSearch.value = true;
  };
  const onLoad = async (params) => {
    await getListData(params);
    nextTick(() => {
      listRef.value?.loadEnd();
    });
  };
  const onSearch = () => {
    onRefresh({
      pageNo: 1,
      pageSize: pageSize.value,
    });
  };
  const resetSearch = () => {
    queryParams.value = {
      orgCode: '',
      orgCodeName: '',
      workshop: '',
      workshopName: '',
      post: '',
      realName: '',
      status: '',
      result: '',
      resultName: '',
    };
    onRefresh({
      pageNo: 1,
      pageSize: pageSize.value,
    });
  };
  const onRefresh = async (params) => {
    await getListData(params);
    nextTick(() => {
      listRef.value?.refreshEnd();
    });
  };
  const pageInit = async () => {
    selectList.value.orgCode = await getDepart3ListWithSecurity();
    if (selectList.value.orgCode.length == 1) {
      queryParams.value.orgCode = selectList.value.orgCode[0].orgCode;
      queryParams.value.orgCodeName = selectList.value.orgCode[0].departName;
      getworkshopList();
    }
  };
  pageInit();

  const getListData = async (params) => {
    const res = await getList({ ...params, ...queryParams.value });
    total.value = res.total;
    datalist.value = res.records;
    console.log(datalist.value);
  };
  const getworkshopList = async () => {
    selectList.value.workshop = await selectDeptNew({ orgCode: queryParams.value.orgCode });
  };

  const fillClick = (item) => {
    router.push({
      path: '/app/safetyResponsibility/dutyFill/fillModal',
      query: {
        id: item.id,
        showFooter: 'false',
        isUpdate: 'false',
      },
    });
  };
  const onConfirm = (value: any, key: string) => {
    switch (key) {
      case 'orgCode':
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
        showPicker.value[key] = false;
        break;
      case 'workshop':
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].departName;
        showPicker.value[key] = false;
        break;
      default:
        queryParams.value[key] = value.selectedValues[0];
        queryParams.value[key + 'Name'] = value.selectedOptions[0].text;
        showPicker.value[key] = false;
        break;
    }
  };
  /**
   * 查看详情
   */
  const handleDetail = (item: any) => {
    router.push({
      name: 'AppSafetyResponsibilityDutyReviewDetail',
      query: {
        id: item.id,
        mode: 'detail',
      },
    });
  };
  const postTypeClick = (e) => {
    queryParams.value.postType = e;
  };
  const resultClick = (e) => {
    console.log('resultClick', e);
    queryParams.value.result = e;
  };
  const statusClick = (e) => {
    queryParams.value.status = e;
  };
</script>
<style lang="less" scoped>
  .ledger {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #f5f5f5;

    .hd {
      height: 54px;
      line-height: 54px;
      font-size: 14px;
      color: #333;
      clear: both;
    }

    .filter-btn {
      margin-left: 2px;
      margin-top: -4px;
      display: inline-block;
      vertical-align: middle;
      img {
        width: 25px;
        height: 25px;
      }
    }

    .main {
      flex: 1;
      overflow: hidden;
      padding: 10px 16px;
    }
  }
  .mybubble {
    width: 50px !important;
    height: 26px !important;
    .content {
      font-size: 12px !important;
      display: flex;
      align-items: center;
      justify-content: center;
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
