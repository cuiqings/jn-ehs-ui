<template>
  <van-list class="certificate">
    <div class="head">
      <div class="left">
        <van-search
          class="search-left"
          shape="round"
          background="transparent"
          v-model="queryParam.searchParam"
          placeholder="请输入"
          @search="loadData"
          @clear="clearSearch"
        />
      </div>
      <div class="right" @click="showSearchDrawer">
        <span>筛选</span>
        <img src="../../../../assets/images/emergency/down.png" width="9" height="5" />
      </div>
    </div>
    <van-list
      v-if="dataSource.length > 0"
      v-model:loading="loading"
      :finished="finished"
      :finished-text="dataSource.length > 0 ? '没有更多了' : ''"
      @load="onLoad"
    >
      <div class="list" v-for="(item, index) in dataSource" :key="index">
        <div>
          <p> {{ item.departName }} </p>
          <div>
            <span v-auth="'meetingBeforeClass:edit'" @click="handleEdit(item)">编辑</span>
            <span @click="toDetails(item)">查看</span>
          </div>
        </div>
        <div> 班组名称：{{ item.teamName }} </div>
        <div> 所属单位：{{ item.orgName }} </div>
        <div> 班次：{{ item.teamOrder }} </div>
        <div> 是否完成：{{ item.completeFlag === '1' ? '是' : item.completeFlag === '0' ? '否' : '' }} </div>
        <div> 班前会时间：{{ item.preShiftTime }} </div>
      </div>
    </van-list>
    <a-empty v-if="dataSource.length === 0" style="margin-top: 50%" />
    <van-popup v-model:show="showRight" closeable position="right" :style="{ width: '294px', height: '100%' }">
      <div class="search">
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">所属单位</div>
            <div class="choose-list">
              <a-select
                v-model:value="queryParam.org"
                class="custom-input"
                :getPopupContainer="getPopupContainer"
                placeholder="请选择"
                :options="orgOptions"
                :showSearch="true"
                :filterOption="(input: string, option: any) => { return option.label.toLowerCase().indexOf(input.toLowerCase()) >=
              0; }"
                @change="changeOrg"
              />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">车间</div>
            <div class="choose-list">
              <a-select
                v-model:value="queryParam.depart"
                class="custom-input"
                :getPopupContainer="getPopupContainer"
                placeholder="请选择"
                :options="departOptions"
                :showSearch="true"
                :filterOption="(input: string, option: any) => { return option.label.toLowerCase().indexOf(input.toLowerCase()) >=
              0; }"
              />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label"> 班组名称</div>
            <div class="choose-list">
              <a-input v-model:value="queryParam.teamName" class="custom-input" placeholder="请输入" />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label"> 班次</div>
            <div class="choose-list">
              <a-select
                v-model:value="queryParam.teamOrder"
                class="custom-input"
                :getPopupContainer="getPopupContainer"
                placeholder="请选择"
                :options="shiftOptions"
              />
            </div>
          </div>
          <div class="content-item" style="position: relative; margin-bottom: 20px">
            <div class="item-label">班前会时间</div>
            <a-input class="custom-input" v-model:value="date" readonly placeholder="请选择" @click="showTime = true" />
            <van-icon name="arrow-down" class="arrow-down" @click="showTime = true" />
          </div>
          <div class="content-item">
            <div class="item-label">是否完成</div>
            <div class="choose-list">
              <a-select
                v-model:value="queryParam.completeFlag"
                class="custom-input"
                :getPopupContainer="getPopupContainer"
                placeholder="请选择"
                :options="completeFlagOptions"
                allowClear
              />
            </div>
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <van-calendar v-model:show="showTime" type="range" :min-date="new Date('2023-01-01')" :allow-same-day="true" @confirm="onConfirm" />
  </van-list>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { list } from '../../meetingBeforeClass/url/index';
  import { getDepart3ListWithSecurity } from '/@/api/common/api';
  import { getPopupContainer } from '/@/utils';
  import { setAppTitle } from '/@/utils/index';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  setAppTitle('班前会管理');
  const router = useRouter();
  const queryParam: any = reactive({
    pageNo: 1,
    pageSize: 10,
    org: undefined,
    depart: undefined,
    teamName: '',
    searchParam: '',
    teamOrder: undefined,
    completeFlag: undefined,
    preShiftTimeStart: undefined,
    preShiftTimeEnd: undefined,
  });
  const dataSource: any = ref([]);
  const showRight = ref(false);
  const orgOptions = ref<any>([]);
  const departOptions: any = ref([]);
  const shiftOptions = ref<any>([
    { label: '甲', value: '甲' },
    { label: '乙', value: '乙' },
    { label: '丙', value: '丙' },
    { label: '常白班', value: '常白班' },
  ]);
  const completeFlagOptions = ref([
    { label: '是', value: '1' },
    { label: '否', value: '0' },
  ]);
  const showTime = ref(false);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const date = ref('');
  // 所属机构列表
  const getOrgList = async () => {
    orgOptions.value = [];
    await getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  const changeOrg = (value) => {
    if (value) {
      getDepartList(value);
    } else {
      departOptions.value = [];
    }
  };
  // 车间列表
  const getDepartList = (orgCode) => {
    departOptions.value = [];
    defHttp.get({ url: '/jn/common/selectDeptNew', params: { orgCode } }).then((res) => {
      res.map((item: any) => {
        departOptions.value.push({
          label: item.departName,
          value: item.orgCode,
        });
      });
    });
  };
  // 筛选
  const showSearchDrawer = () => {
    showRight.value = true;
  };
  const onConfirm = (values) => {
    const [start, end] = values;
    showTime.value = false;
    date.value = `${dayjs(start).format('YYYY-MM-DD')} - ${dayjs(end).format('YYYY-MM-DD')}`;
    queryParam.preShiftTimeStart = `${dayjs(start).format('YYYY-MM-DD')}`;
    queryParam.preShiftTimeEnd = `${dayjs(end).format('YYYY-MM-DD')}`;
  };
  // 筛选-确认
  const handleConfirm = () => {
    queryParam.pageNo = 1;
    showRight.value = false;
    loadData();
  };
  // 重置
  function handleReset() {
    queryParam.pageNo = 1;
    queryParam.org = undefined;
    queryParam.depart = undefined;
    queryParam.teamName = '';
    queryParam.searchParam = '';
    queryParam.teamOrder = undefined;
    queryParam.completeFlag = undefined;
    queryParam.preShiftTimeStart = undefined;
    queryParam.preShiftTimeEnd = undefined;
    date.value = '';
    departOptions.value = [];
  }
  const handleEdit = (item) => {
    router.push({
      path: '/app/meetingBeforeClass/details',
      query: {
        id: item.id,
        type: 'edit',
      },
    });
  };
  // 详情
  const toDetails = (item) => {
    router.push({
      path: '/app/meetingBeforeClass/details',
      query: {
        id: item.id,
        type: 'view',
      },
    });
  };
  const loadData = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (orgOptions.value.length === 1) {
      queryParam.organizationCode = orgOptions.value[0].value;
    }
    await list(queryParam)
      .then((res) => {
        if (res) {
          total.value = res.total;
          if (is) dataSource.value = res.records;
          else dataSource.value = dataSource.value.concat(res.records);
        }
      })
      .finally(() => {
        loading.value = false;
        finished.value = false;
      });
  };
  const onLoad = () => {
    if (dataSource.value.length == total.value) {
      finished.value = true;
    } else {
      finished.value = false;
      // 加载状态结束
      loading.value = false;
      scrollCallback();
    }
  };
  //滚动后继续加载的回调函数
  const scrollCallback = () => {
    queryParam.pageNo++;
    loadData(false);
  };
  const clearSearch = () => {
    queryParam.userRealname = '';
    loadData();
  };
  onMounted(async () => {
    await getOrgList();
    await loadData();
  });
</script>
<style lang="less" scoped>
  .certificate {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    .head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 14px;
      font-size: 13px;
      .left {
        float: left;
        width: 250px;
        :deep(.van-search) {
          padding: 0;
        }
        :deep(.van-field) {
          flex-wrap: wrap;
          height: 40px !important;
        }
      }
      .right {
        width: 74px;
        height: 40px;
        border-radius: 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        color: rgba(0, 0, 0, 0.87);
        display: flex;
        align-items: center;
        justify-content: center;
        :first-child {
          margin-right: 5px;
        }
      }
    }
    .list {
      background: #ffffff;
      border-radius: 4px;
      opacity: 1;
      padding: 16px 13px;
      width: calc(100% - 26px);
      margin: 0 13px 8px 13px;
      & > div:first-child {
        display: flex;
        align-items: center;
        justify-content: space-between;
        span {
          color: #3e87f8;
          margin: 0 10px;
          font-size: 14px;
        }
      }
      p {
        font-size: 15px;
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.87);
        margin-bottom: 0;
        display: flex;
        justify-content: space-between;
        & > span {
          font-size: 13px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 400;
          color: #b0afaf;
        }
      }
      div {
        font-size: 12px;
        font-family: Source Han Sans CN, Source Han Sans CN;
        font-weight: 400;
        color: #b0afaf;
      }
    }
    .search {
      height: 100%;
      .search-title {
        font-size: 16px;
        font-family: SourceHanSansCN-Medium-, SourceHanSansCN-Medium;
        color: rgba(0, 0, 0, 0.87);
        margin: 12px 0 12px 16px;
      }
      .search-split {
        width: 100%;
        height: 1px;
        background: #eff1f5;
        border-radius: 0px 0px 0px 0px;
      }
      .content-box {
        margin-left: 16px;
        .content-item {
          margin-top: 12px;
          .item-label {
            font-size: 13px;
            font-family: Source Han Sans CN-Regular, Source Han Sans CN;
            font-weight: 400;
            color: #000000;
          }
          .choose-list {
            margin-top: 8px;
            .choose-item {
              display: inline-block;
              width: 128px;
              height: 36px;
              background: #eff1f5;
              border-radius: 4px 4px 4px 4px;
              line-height: 36px;
              font-size: 14px;
              color: rgba(0, 0, 0, 0.6);
              text-align: center;
              margin-bottom: 8px;
              border: 1px solid #eff1f5;
              cursor: pointer;
              text-overflow: -o-ellipsis-lastline;
              overflow: hidden;
              text-overflow: ellipsis;
              -webkit-line-clamp: 1;
              line-clamp: 1;
              -webkit-box-orient: vertical;
            }
            .item-margin {
              margin-right: 8px;
            }
            .item-active {
              border: 1px solid #3e87f8;
              background: rgba(62, 135, 248, 0.1);
            }
          }
          .arrow-down {
            position: absolute;
            right: 30px;
            top: 40px;
            z-index: 999;
            width: 8px;
            height: 4px;
            cursor: pointer;
          }
        }
      }
      .action-btn {
        // position: absolute;
        // right: 0px;
        // bottom: 0px;
        width: 100%;
        // z-index: 999;
        :first-child {
          display: inline-block;
          cursor: pointer;
          width: 50%;
          color: rgba(0, 0, 0, 0.6);
          height: 53px;
          line-height: 53px;
          background: #f7f8fa;
          text-align: center;
        }
        :last-child {
          display: inline-block;
          cursor: pointer;
          width: 50%;
          height: 53px;
          line-height: 53px;
          font-weight: 600;
          color: #ffffff;
          background: #3e87f8;
          cursor: pointer;
          text-align: center;
        }
      }
    }
    .custom-input {
      width: 264px;
      height: 32px;
      border-radius: 4px;
      margin-top: 8px;
    }
    .van-loading {
      text-align: center;
      margin-top: 40px;
    }
  }
  :deep(.van-popup) {
    overflow-y: hidden;
    height: 100%;
    .content-box {
      height: calc(100% - 104px);
      overflow-y: auto;
    }
  }
</style>
