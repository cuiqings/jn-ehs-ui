<template>
  <div class="personnel">
    <van-tabs v-model:active="queryForm.aptitudeStatus" @change="handleConfirm">
      <van-tab v-for="item in tabsArr" :key="item.keys" :name="item.keys" :title="item.title">
        <div class="search-wrap">
          <van-search v-model="queryForm.name" class="search-left" placeholder="请输入" shape="round" @search="handleConfirm" />
          <div class="search-right" @click="showSearchDrawer">
            <span class="btn-text">筛选</span>
            <img :src="down" class="btn-icon" />
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
            <div v-for="ite in listArr" :key="ite.id" class="list" @click="handleView(ite)">
              <div><img :src="personnel" class="list-icon" /></div>
              <div>
                <p>
                  {{ ite.name }}
                </p>
                <div> 企业名称：{{ ite.companyName }}</div>
                <div> 工号：{{ ite.workNo }}</div>
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
                      :color="
                        ite.certificateStatus === '1'
                          ? 'rgba(211, 245, 237, 0.9)'
                          : ite.certificateStatus === '2'
                          ? 'rgba(220, 20, 60, 0.2)'
                          : ite.certificateStatus === '3'
                          ? 'rgba(255, 165, 0, 0.2)'
                          : ''
                      "
                      :style="{
                        color:
                          ite.certificateStatus === '1'
                            ? '#09c199'
                            : ite.certificateStatus === '2'
                            ? 'rgb(220, 20, 60)'
                            : ite.certificateStatus === '3'
                            ? '#FFA500'
                            : '',
                      }"
                      >{{
                        ite.certificateStatus === '1'
                          ? '正常'
                          : ite.certificateStatus === '2'
                          ? '过期'
                          : ite.certificateStatus === '3'
                          ? '即将到期'
                          : ''
                      }}</a-tag
                    >
                  </span>
                </div>
                <div> 分数：{{ ite.score }}</div>
                <div> 联系方式：{{ ite.phone }}</div>
                <div> 身份证号：{{ ite.idNumber }}</div>
              </div>
            </div>
          </van-list>
          <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
        </div>
      </van-tab>
    </van-tabs>
    <van-popup
      v-model:show="showRight"
      :style="{ width: '294px', height: '100%' }"
      closeable
      position="right"
      @click-overlay="handleConfirm(false)"
      @click-close-icon="handleConfirm(false)"
    >
      <div>
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div v-if="orgCode.slice(0, 6) !== 'A04B12'" class="content-item">
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
                v-for="item in statusOptions"
                :key="item.value"
                :class="queryForm.status === item.value ? 'active' : ''"
                @click="queryForm.status = item.value"
                >{{ item.label }}
              </div>
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">证书状态</div>
            <div class="item-select">
              <div
                v-for="item in certificateStatusOptions"
                :key="item.value"
                :class="queryForm.certificateStatus === item.value ? 'active' : ''"
                @click="queryForm.certificateStatus = item.value"
                >{{ item.label }}
              </div>
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">是否特种作业人员</div>
            <div class="item-select">
              <div
                v-for="item in ifSpecialOperatorOptions"
                :key="item.value"
                :class="queryForm.ifSpecialOperator === item.value ? 'active' : ''"
                @click="queryForm.ifSpecialOperator = item.value"
                >{{ item.label }}
              </div>
            </div>
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
<script lang="ts" name="app-personnel-list" setup>
  import { list } from './url/index';
  import down from '/@/assets/images/emergency/down.png';
  import personnel from '/@/assets/images/certificate/user_zg.png';
  import { ref, onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { setAppTitle } from '/@/utils/index';
  import { useUserStore } from '/@/store/modules/user';

  const userStore = useUserStore();
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  const router = useRouter();
  setAppTitle('人员列表');
  const showRight = ref(false);
  const loading = ref(false);
  const finished = ref(false);
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
    {
      label: '即将到期',
      value: '3',
    },
  ];
  const ifSpecialOperatorOptions = [
    {
      label: '是',
      value: '1',
    },
    {
      label: '否',
      value: '2',
    },
  ];
  const tabsArr = [
    {
      title: '未进场',
      keys: '4',
    },
    {
      title: '离场',
      keys: '3',
    },
    {
      title: '在场',
      keys: '1,2',
    },
  ];
  const total = ref(0);
  const queryForm = reactive({
    pageNo: 1,
    pageSize: 10,
    blackFlag: '0',
    companyName: '',
    name: '',
    workNo: '',
    phone: '',
    idNumber: '',
    status: '',
    certificateStatus: '',
    aptitudeStatus: '4',
    ifSpecialOperator: '',
  });
  const listArr = ref<any[]>([]);
  onMounted(() => {
    init();
  });
  const init = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (is) {
      listArr.value = [];
    }
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
    // queryForm.companyName = '';
    // queryForm.name = '';
    // queryForm.workNo = '';
    // queryForm.phone = '';
    // queryForm.idNumber = '';
    // queryForm.status = '';
    // queryForm.certificateStatus = '';
    // queryForm.ifSpecialOperator = '';
    showRight.value = true;
  };
  const handleReset = () => {
    queryForm.companyName = '';
    queryForm.name = '';
    queryForm.workNo = '';
    queryForm.phone = '';
    queryForm.idNumber = '';
    queryForm.status = '';
    queryForm.certificateStatus = '';
    queryForm.ifSpecialOperator = '';
    queryForm.pageNo = 1;
  };
  const handleConfirm = (is = true) => {
    showRight.value = false;
    if (is) {
      queryForm.pageNo = 1;
      init();
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
    queryForm.pageNo++;
    init(false);
  };
  const handleView = (data) => {
    router.push({
      path: '/app/sm/personnel/view',
      query: {
        id: data.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .personnel {
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
          line-height: 25px;
        }

        .status {
          margin: 5px 0;
        }

        & > .shu {
          margin: 0 0 4px 0;

          & > span:nth-child(2) {
            margin-left: 8px;
            padding-left: 8px;
            border-left: 1px solid rgba(0, 0, 0, 0.16);
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
          display: flex;
          margin-top: 8px;

          & > div {
            background-color: rgba(0, 0, 0, 0.2);
            height: 30px;
            width: 80px;
            border-radius: 15px;
            text-align: center;
            line-height: 30px;
            cursor: pointer;
            margin-left: 10px;
          }

          & > div:nth-child(1) {
            margin-left: 0;
          }

          .active {
            background-color: #3e87f8;
            color: #fff;
          }
        }
      }
    }
  }
</style>
