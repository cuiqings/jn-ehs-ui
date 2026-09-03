<template>
  <div class="enterprise">
    <div class="search-wrap">
      <van-search class="search-left" shape="round" v-model="queryForm.companyName" placeholder="请输入" @search="handleConfirm" />
      <div class="search-right" @click="showSearchDrawer">
        <span class="btn-text">筛选</span>
        <img class="btn-icon" :src="down" />
      </div>
    </div>
    <div>
      <van-list
        v-if="listArr.length > 0"
        v-model:loading="loading"
        :finished="finished"
        :finished-text="listArr.length > 0 ? '没有更多了' : ''"
        @load="onLoad"
      >
        <div class="list" v-for="item in listArr" :key="item.id" @click="handleView(item)">
          <div> <img class="list-icon" :src="enterprise" /></div>
          <div>
            <p><a-tag v-if="item.newFlag === '1'" color="#f40" style="margin-right: 5px">新</a-tag>{{ item.companyName }}</p>
            <div>主要负责人：{{ item.companyManager }} </div>
            <div>主要负责人电话：{{ item.projectPhone }}</div>
            <div>分数：{{ item.score }}</div>
            <div>创建人：{{ item.createUserName }}</div>
            <div>创建人单位：{{ item.createOrgName }}</div>
            <div>状态：<span v-if="item.status === '1'" class="text-green-500">合同内</span> <span v-else>合同外</span></div>
          </div>
        </div>
      </van-list>
      <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
    </div>
    <van-popup
      v-model:show="showRight"
      closeable
      position="right"
      :style="{ width: '320px', height: '100%' }"
      @click-overlay="handleReset"
      @click-close-icon="handleReset"
    >
      <div>
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item" v-if="orgCode.slice(0, 6) !== 'A04B12'">
            <div class="item-label">企业名称</div>
            <a-input v-model:value="queryForm.companyName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">主要负责人</div>
            <a-input v-model:value="queryForm.companyManager" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">创建人</div>
            <a-input v-model:value="queryForm.createUserName" placeholder="请输入" />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
  </div>
</template>
<script setup name="app-enterprise-list" lang="ts">
  import { list } from './url/index';
  import down from '/@/assets/images/emergency/down.png';
  import enterprise from '/@/assets/images/sm/enterprise.png';
  import { ref, onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  setAppTitle('企业列表');
  const router = useRouter();
  const showRight = ref(false);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const queryForm = reactive({
    pageNo: 1,
    pageSize: 10,
    column: 'updateTime',
    order: 'desc',
    blackFlag: '0',
    companyName: '',
    companyManager: '',
    createUserName: '',
  });
  const listArr = ref<any[]>([]);
  onMounted(() => {
    init();
  });
  const init = async (is = true) => {
    loading.value = true;
    finished.value = true;
    list(queryForm)
      .then((res) => {
        if (res) {
          total.value = res.total;
          if (is) listArr.value = res.records;
          else listArr.value = listArr.value.concat(res.records);
        }
      })
      .finally(() => {
        loading.value = false;
        finished.value = false;
      });
  };
  const showSearchDrawer = () => {
    showRight.value = true;
    queryForm.companyName = '';
    queryForm.companyManager = '';
    queryForm.createUserName = '';
  };
  const handleReset = () => {
    queryForm.companyName = '';
    queryForm.companyManager = '';
    queryForm.createUserName = '';
    queryForm.pageNo = 1;
  };
  const handleConfirm = () => {
    queryForm.pageNo = 1;
    showRight.value = false;
    init();
  };
  const onLoad = () => {
    if (listArr.value.length == total.value) {
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
    queryForm.pageNo++;
    init(false);
  };
  const handleView = (data) => {
    router.push({
      path: '/app/sm/enterprise/view',
      query: {
        data: JSON.stringify(data),
      },
    });
  };
</script>
<style lang="less" scoped>
  .enterprise {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .search-wrap {
      clear: both;
      overflow: hidden;
      margin-bottom: 10px;
      background-color: #fff;
      .search-left {
        float: left;
        width: calc(100% - 86px);
      }
      .search-right {
        float: right;
        width: 74px;
        height: 40px;
        border-radius: 20px 20px 20px 20px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        margin: 7px 12px 0 0;
        text-align: center;
        line-height: 40px;
        .btn-text {
          font-size: 13px;
          font-family: PingFang SC-Regular, PingFang SC;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.87);
        }
        .btn-icon {
          display: inline-block;
          width: 10px;
          height: 10px;
          margin-left: 4px;
        }
      }
    }
    .list {
      background: #ffffff;
      border-radius: 4px;
      opacity: 1;
      padding: 16px 13px;
      display: flex;
      width: calc(100% - 26px);
      margin: 0 13px 8px 13px;
      & > div:nth-child(1) {
        width: 48px;
        img {
          width: 48px;
          height: 48px;
        }
      }
      & > div:nth-child(2) {
        width: calc(100% - 58px);
        margin-left: 10px;
        p {
          font-size: 15px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 400;
          color: rgba(0, 0, 0, 0.87);
          margin-bottom: 0;
        }
        div {
          font-size: 12px;
          font-family: Source Han Sans CN, Source Han Sans CN;
          font-weight: 400;
          color: #b0afaf;
        }
        & > div:nth-child(2) {
          & > span:nth-child(2) {
            margin-left: 24px;
          }
        }
      }
    }
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
    .action-btn {
      position: absolute;
      right: 0px;
      bottom: 0px;
      width: 100%;
      z-index: 999;
      .btn-item-1 {
        display: inline-block;
        cursor: pointer;
        width: 50%;
        color: rgba(0, 0, 0, 0.6);
        height: 53px;
        line-height: 53px;
        background: #f7f8fa;
        text-align: center;
      }
      .btn-item-2 {
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
    .content-box {
      margin: 0 16px;
      padding-bottom: 80px;
      .content-item {
        margin-top: 12px;
        .item-label {
          font-size: 13px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #000000;
        }
        .ant-input {
          width: 100%;
          height: 46px;
          border-radius: 4px 4px 4px 4px;
          margin-top: 8px;
        }

        .item-select {
          margin-top: 8px;
          display: flex;
          justify-content: space-between;
          & > div {
            height: 30px;
            border-radius: 15px;
            line-height: 30px;
            width: 80px;
            text-align: center;
            background: rgba(0, 0, 0, 0.1);
          }
          .select-active {
            background: #3e87f8;
            color: #fff;
          }
        }
        .item-date {
          display: flex;
          margin-top: 8px;
          .ant-picker {
            width: 50%;
            height: 46px;
            border-radius: 4px 4px 4px 4px;
          }
        }
      }
    }
  }
</style>
