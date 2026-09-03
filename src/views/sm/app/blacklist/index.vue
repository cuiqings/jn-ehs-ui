<template>
  <div class="blacklist">
    <div class="search-wrap">
      <van-search
        class="search-left"
        v-if="tabActive === '1'"
        shape="round"
        v-model="queryForm.companyName"
        placeholder="请输入"
        @search="handleConfirm"
      />
      <van-search class="search-left" v-else shape="round" v-model="queryForm.name" placeholder="请输入" @search="handleConfirm" />
      <div class="search-right" @click="showSearchDrawer">
        <span class="btn-text">筛选</span>
        <img class="btn-icon" :src="down" />
      </div>
    </div>
    <div>
      <van-tabs v-model:active="tabActive" @change="changTabs">
        <van-tab v-for="item in tabsArr" :name="item.keys" :key="item.keys" :title="item.title">
          <van-list
            v-if="listArr.length > 0"
            v-model:loading="loading"
            :finished="finished"
            :finished-text="listArr.length > 0 ? '没有更多了' : ''"
            @load="onLoad"
          >
            <div class="list" :data-index="index" v-for="(ite, index) in listArr" :key="ite.id">
              <div v-if="tabActive === '1'" @click="handleView1(ite)">
                <div> <img class="list-icon" :src="enterprise" /></div>
                <div>
                  <p>{{ ite.companyName }}</p>
                  <div>主要负责人：{{ ite.companyManager }} </div>
                  <div>主要负责人电话：{{ ite.projectPhone }}</div>
                  <div>创建人：{{ ite.createUserName }}</div>
                  <div>创建人单位：{{ ite.createOrgName }}</div>
                  <div>列入原因：{{ ite.blackRemark }}</div>
                </div>
              </div>
              <div v-else @click="handleView2(ite)">
                <div> <img class="list-icon" :src="personnel" /></div>
                <div>
                  <p>
                    {{ ite.name }}
                  </p>
                  <div> 企业名称：{{ ite.companyName }} </div>
                  <div> 工号：{{ ite.workNo }} </div>
                  <div class="shu">
                    <span
                      >账号状态：
                      <a-tag
                        :color="ite.status === '1' ? 'rgba(211, 245, 237, 0.9)' : 'rgba(220, 20, 60, 0.2)'"
                        :style="{ color: ite.status === '1' ? '#09c199' : 'rgb(220, 20, 60)' }"
                        >{{ ite.status === '2' ? '冻结' : '正常' }}</a-tag
                      ></span
                    >
                    <span>
                      证书状态：
                      <a-tag
                        :color="ite.certificateStatus === '1' ? 'rgba(211, 245, 237, 0.9)' : 'rgba(220, 20, 60, 0.2)'"
                        :style="{ color: ite.certificateStatus === '1' ? '#09c199' : 'rgb(220, 20, 60)' }"
                        >{{ ite.certificateStatus === '2' ? '过期' : '正常' }}</a-tag
                      >
                    </span>
                  </div>
                  <div> 联系方式：{{ ite.phone }} </div>
                  <div> 身份证号：{{ ite.idNumber }} </div>
                  <div>列入原因：{{ ite.blackRemark }}</div>
                </div>
              </div>
            </div>
          </van-list>
          <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
        </van-tab>
      </van-tabs>
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
        <div class="content-box" v-if="tabActive === '1'">
          <div class="content-item">
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
          <div class="content-item">
            <div class="item-label">列入原因</div>
            <a-input v-model:value="queryForm.blackRemark" placeholder="请输入" />
          </div>
        </div>
        <div class="content-box" v-else>
          <div class="content-item">
            <div class="item-label">企业名称</div>
            <a-input v-model:value="queryForm.companyName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">姓名</div>
            <a-input v-model:value="queryForm.name" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">工号</div>
            <a-input v-model:value="queryForm.workNo" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">联系方式</div>
            <a-input v-model:value="queryForm.phone" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">身份证号</div>
            <a-input v-model:value="queryForm.idNumber" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">账号状态</div>
            <div class="item-select">
              <div
                :class="queryForm.status === item.value ? 'active' : ''"
                v-for="item in statusOptions"
                :key="item.value"
                @click="queryForm.status = item.value"
                >{{ item.label }}</div
              >
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">证书状态</div>
            <div class="item-select">
              <div
                :class="queryForm.certificateStatus === item.value ? 'active' : ''"
                v-for="item in certificateStatusOptions"
                :key="item.value"
                @click="queryForm.certificateStatus = item.value"
                >{{ item.label }}</div
              >
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">列入原因</div>
            <a-input v-model:value="queryForm.blackRemark" placeholder="请输入" />
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
<script setup name="app-blacklist-list" lang="ts">
  import enterprise from '/@/assets/images/sm/enterprise.png';
  import down from '/@/assets/images/emergency/down.png';
  import personnel from '/@/assets/images/certificate/user_zg.png';
  import { ref, onMounted } from 'vue';
  import { enterpriseList, list } from '../../blacklist/url/index';
  import { setAppTitle } from '/@/utils/index';
  import { useRouter } from 'vue-router';
  const router = useRouter();
  setAppTitle('黑名单');
  const showRight = ref(false);
  const tabsArr = [
    {
      title: '企业黑名单',
      keys: '1',
    },
    {
      title: '用工黑名单',
      keys: '2',
    },
  ];
  const tabActive = ref('1');
  const listArr: any = ref([]);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const queryForm: any = ref({
    pageNo: 1,
    pageSize: 10,
    column: 'updateTime',
    order: 'desc',
    blackFlag: '1',
    companyName: '',
    companyManager: '',
    createUserName: '',
    blackRemark: '',
  });
  const statusOptions = [
    {
      label: '正常',
      value: '1',
    },
    {
      label: '冻结',
      value: '2',
    },
  ];
  const certificateStatusOptions = [
    {
      label: '正常',
      value: '1',
    },
    {
      label: '过期',
      value: '2',
    },
  ];
  onMounted(() => {
    init();
  });
  const init = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (tabActive.value === '1') {
      enterpriseList(queryForm.value)
        .then((res) => {
          if (res) {
            total.value = res.total;
            if (is) listArr.value = res.records;
            else listArr.value = listArr.value.concat(res.records);
          }
        })
        .catch(() => {
          total.value = 0;
          listArr.value = [];
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    } else {
      list(queryForm.value)
        .then((res) => {
          if (res) {
            total.value = res.total;
            if (is) listArr.value = res.records;
            else listArr.value = listArr.value.concat(res.records);
          }
        })
        .catch(() => {
          total.value = 0;
          listArr.value = [];
        })
        .finally(() => {
          loading.value = false;
          finished.value = false;
        });
    }
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
    queryForm.value.pageNo++;
    init(false);
  };
  const changTabs = () => {
    if (tabActive.value === '1') {
      Object.assign(queryForm.value, {
        pageNo: 1,
        pageSize: 10,
        column: 'updateTime',
        order: 'desc',
        blackFlag: '1',
        companyName: '',
        companyManager: '',
        createUserName: '',
        blackRemark: '',
      });
    } else {
      Object.assign(queryForm.value, {
        pageNo: 1,
        pageSize: 10,
        column: 'updateTime',
        order: 'desc',
        blackFlag: '1',
        companyName: '',
        name: '',
        workNo: '',
        phone: '',
        idNumber: '',
        status: '',
        certificateStatus: '',
        blackRemark: '',
      });
    }
    listArr.value = [];
    init();
  };
  const showSearchDrawer = () => {
    showRight.value = true;
    handleReset();
  };
  const handleReset = () => {
    if (tabActive.value === '1') {
      Object.assign(queryForm.value, {
        pageNo: 1,
        pageSize: 10,
        column: 'updateTime',
        order: 'desc',
        blackFlag: '1',
        companyName: '',
        companyManager: '',
        createUserName: '',
        blackRemark: '',
      });
    } else {
      Object.assign(queryForm.value, {
        pageNo: 1,
        pageSize: 10,
        column: 'updateTime',
        order: 'desc',
        blackFlag: '1',
        companyName: '',
        name: '',
        workNo: '',
        phone: '',
        idNumber: '',
        status: '',
        certificateStatus: '',
        blackRemark: '',
      });
    }
  };
  const handleConfirm = () => {
    showRight.value = false;
    init();
  };
  const handleView1 = (data) => {
    router.push({
      path: '/app/sm/enterprise/view',
      query: {
        data: JSON.stringify(data),
        blackFlag: data.blackFlag,
      },
    });
  };
  const handleView2 = (data) => {
    router.push({
      path: '/app/sm/personnel/view',
      query: {
        id: data.id,
        blackFlag: data.blackFlag,
      },
    });
  };
</script>
<style lang="less" scoped>
  /deep/.van-tabs__content {
    padding: 10px 0;
  }
  .blacklist {
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
      width: calc(100% - 26px);
      margin: 0 13px 8px 13px;
      & > div {
        display: flex;
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
          & > .shu {
            margin: 0 0 4px 0;
            & > span:nth-child(2) {
              margin-left: 8px;
              padding-left: 8px;
              border-left: 1px solid rgba(0, 0, 0, 0.16);
            }
          }
          & > div:nth-child(2) {
            & > span:nth-child(2) {
              margin-left: 24px;
            }
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
      width: 100%;
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
      padding: 0 16px;
      padding-bottom: 15px;
      height: calc(100vh - 104px);
      overflow-y: auto;
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
          & > div {
            background-color: rgba(0, 0, 0, 0.2);
            height: 30px;
            width: 80px;
            border-radius: 15px;
            text-align: center;
            line-height: 30px;
            cursor: pointer;
          }
          & > div:nth-child(2) {
            margin-left: 20px;
          }
          .active {
            background-color: #3e87f8;
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
