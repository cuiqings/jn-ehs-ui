<template>
  <div class="projectManage">
    <div class="search-wrap">
      <van-search class="search-left" shape="round" v-model="queryForm.projectName" placeholder="请输入" @search="handleConfirm" />
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
        <div class="list" v-for="item in listArr" :key="item.id">
          <div>
            <p> {{ item.type }} </p>
            <div>
              <span v-auth="'adap:edit'" v-if="item.status === '0' || item.status === '2'" @click="handleEdit(item)">编辑</span>
              <span @click="handleView(item)">查看</span>
            </div>
          </div>
          <div> 项目名称：{{ item.projectName }} </div>
          <div> 承包单位：{{ item.contractName }} </div>
          <div> 相关方类别：{{ item.xgfType === '1' ? '施工类' : item.xgfType === '2' ? '生产服务类' : '搬倒类' }} </div>
          <div> 项目期限：{{ item.projectTerm === '1' ? '长期' : '短期' }} </div>
          <div> 发包单位：{{ item.publishName }} </div>
          <div> 经办人：{{ item.publishManagerName }} </div>
          <div> 施工时间：{{ item.workDateStart ? item.workDateStart + '至' + item.workDateEnd : '' }} </div>
          <div>
            状态：<span :style="item.status === '2' ? 'color:red' : ''">{{ selectText(statusOptions, item.status) }}</span>
          </div>
        </div>
      </van-list>
      <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
    </div>
    <van-popup
      v-model:show="showRight"
      closeable
      position="right"
      :style="{ width: '294px', height: '100%' }"
      @click-overlay="handleReset"
      @click-close-icon="handleReset"
    >
      <div>
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">项目名称</div>
            <a-input v-model:value="queryForm.projectName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">申请类型</div>
            <a-select
              v-model:value="queryForm.type"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '入场申请', value: '入场申请' },
                { label: '新增人员', value: '新增人员' },
              ]"
            />
          </div>
          <div class="content-item">
            <div class="item-label">相关方类别</div>
            <a-select
              v-model:value="queryForm.xgfType"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '施工类', value: '1' },
                { label: '生产服务类', value: '2' },
                { label: '搬倒类', value: '3' },
              ]"
            />
          </div>
          <div class="content-item">
            <div class="item-label">项目期限</div>
            <a-select
              v-model:value="queryForm.projectTerm"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="[
                { label: '长期', value: '1' },
                { label: '短期', value: '2' },
              ]"
            />
          </div>
          <div class="content-item">
            <div class="item-label">发包单位</div>
            <a-select
              v-model:value="queryForm.territorialUnit"
              :getPopupContainer="getPopupContainer"
              placeholder="请选择"
              :options="territorialUnitOptions"
            />
          </div>
          <div class="content-item" v-if="orgCode.slice(0, 6) !== 'A04B12'">
            <div class="item-label">承包单位</div>
            <a-input v-model:value="queryForm.contractName" placeholder="请输入" />
          </div>
          <div class="content-item">
            <div class="item-label">状态</div>
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
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <div class="go-add" @click="() => (show = true)"><plus-outlined /></div>
    <action-sheet
      v-model:show="show"
      :actions="actions"
      cancel-text="取消"
      close-on-click-action
      @cancel="() => (show = false)"
      @select="handleSheet"
    />
  </div>
</template>
<script setup name="app-admissionApplication-list" lang="ts">
  import { list, getDepart3ListWithSecurity } from '../../admissionApplication/url/index';
  import down from '/@/assets/images/emergency/down.png';
  import { PlusOutlined } from '@ant-design/icons-vue';
  import { ref, onMounted, reactive } from 'vue';
  import { ActionSheet } from 'vant';
  import { useRouter } from 'vue-router';
  import { getPopupContainer } from '/@/utils';
  import { setAppTitle } from '/@/utils/index';
  import { useUserStore } from '/@/store/modules/user';
  const userStore = useUserStore();
  const orgCode: any = ref('');
  orgCode.value = userStore.getUserInfo.orgCode;
  setAppTitle('资质申请');
  const router = useRouter();
  const showRight = ref(false);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const show = ref(false);
  const queryForm = reactive({
    pageNo: 1,
    pageSize: 10,
    projectName: '',
    type: undefined,
    xgfType: undefined,
    projectTerm: undefined,
    contractName: '',
    territorialUnit: undefined,
    status: '',
  });
  const actions = [
    { name: '入场申请', value: '入场申请' },
    { name: '新增人员', value: '新增人员' },
  ];
  const statusOptions = [
    { label: '待提交', value: '0' },
    { label: '审批中', value: '1' },
    { label: '审批退回', value: '2' },
    { label: '待作业', value: '3' },
    { label: '施工作业中', value: '4' },
    { label: '已结束', value: '5' },
  ];
  const territorialUnitOptions: any = ref([]);
  const listArr = ref<any[]>([]);
  onMounted(async () => {
    await getDepart3ListWithSecurity().then((res) => {
      territorialUnitOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
        };
      });
    });
    await init();
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
    reset();
    showRight.value = true;
  };
  const handleReset = () => {
    reset();
    queryForm.pageNo = 1;
  };
  const reset = () => {
    queryForm.projectName = '';
    queryForm.type = undefined;
    queryForm.xgfType = undefined;
    queryForm.projectTerm = undefined;
    queryForm.contractName = '';
    queryForm.territorialUnit = territorialUnitOptions.value.length === 1 ? territorialUnitOptions.value[0].value : undefined;
    queryForm.status = '';
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
  const selectText = (options, type) => {
    const text = options.filter((item) => item.value === type)[0]?.label;
    return text;
  };
  const handleSheet = (action) => {
    router.push({
      path: '/app/sm/admissionApplication/addOrEdit',
      query: {
        type: 'add',
        addType: action.value,
      },
    });
  };
  const handleEdit = (data) => {
    router.push({
      path: '/app/sm/admissionApplication/addOrEdit',
      query: {
        id: data.id,
        type: 'edit',
        addType: data.type,
      },
    });
  };
  const handleView = (data) => {
    router.push({
      path: '/app/sm/details',
      query: {
        type: 'view',
        addType: data.type,
        id: data.id,
      },
    });
  };
</script>
<style lang="less" scoped>
  .projectManage {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .go-add {
      width: 54px;
      height: 54px;
      text-align: center;
      border-radius: 50%;
      background-color: #ffffff;
      position: fixed;
      bottom: 30px;
      right: 20px;
      box-shadow: 0px 3px 8px 1px rgba(0, 0, 0, 0.16);
      color: #3e87f8;
      font-size: 34px;
    }
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
      margin: 0 0 0 16px;
      height: calc(100vh - 104px);
      overflow-y: auto;
      padding-right: 16px;
      .content-item {
        margin-top: 12px;
        .item-label {
          font-size: 13px;
          font-family: Source Han Sans CN-Regular, Source Han Sans CN;
          font-weight: 400;
          color: #000000;
        }
        .ant-input,
        /deep/.ant-select {
          width: 100%;
          height: 46px;
          border-radius: 4px 4px 4px 4px;
          margin-top: 8px;
          .ant-select-selector {
            height: 46px;
            .ant-select-selection-search-input,
            .ant-select-selection-placeholder,
            .ant-select-selection-item,
            .ant-select-selection-item > span {
              height: 44px;
              line-height: 44px;
            }
          }
        }
        .item-select {
          margin-top: 8px;
          & > div {
            background-color: rgba(0, 0, 0, 0.2);
            height: 30px;
            width: 100px;
            border-radius: 15px;
            text-align: center;
            line-height: 30px;
            display: inline-block;
            margin: 0 10px 10px 0;
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
