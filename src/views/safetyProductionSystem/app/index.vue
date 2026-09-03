<template>
  <div class="certificate">
    <div class="head">
      <div class="left">
        <van-search
          class="search-left"
          shape="round"
          background="transparent"
          v-model="queryParam.userRealname"
          placeholder="请输入"
          @search="loadData"
          @clear="clearSearch"
        />
      </div>
      <div class="right" @click="showSearchDrawer">
        <span>筛选</span>
        <img src="../../../assets/images/emergency/down.png" width="9" height="5" />
      </div>
    </div>
    <!-- <van-loading v-if="loading">加载中，请稍后..</van-loading> -->
    <van-list
      v-if="dataSource.length > 0"
      v-model:loading="loading"
      :finished="finished"
      :finished-text="dataSource.length > 0 ? '没有更多了' : ''"
      @load="onLoad"
    >
      <div class="list" v-for="(item, index) in dataSource" :key="index">
        <div class="top">
          <div class="left">
            <img src="../../../assets/images/certificate/user_zg.png" width="48" height="68" />
          </div>
          <div class="right">
            <div class="number">
              <span>证书编号：</span>
              <a-tooltip placement="bottom">
                <template #title>
                  <span>{{ item.certificationsCode }}</span>
                </template>
                {{ item.certificationsCode }}
              </a-tooltip>
            </div>
            <div class="name">{{ item.userRealname }}</div>
            <div>{{
              item.certificationsType === '1' || item.certificationsType === '2'
                ? item.workType_dictText + ' > ' + item.actionItems_dictText
                : item.certificationsName
            }}</div>
          </div>
        </div>
        <div class="list_item">
          发证日期：<span>{{ item.issueDate }}</span>
        </div>
        <div v-if="item.reviewTime" class="list_item">
          下次复审/换证日期：<span>{{ item.reviewTime }}</span>
        </div>
        <div class="bottom">
          <div class="three">
            <div class="flex" v-if="item.whetherReview === '1'" v-auth="'staffCertifications:reexamine'" @click="recheck(item)">
              <img src="../../../assets/images/certificate/edit.png" width="14" height="14" />
              <div>复审</div>
            </div>
            <div v-auth="'staffCertifications:reexamine'" v-if="item.whetherReview === '1'">
              <div v-auth="'staffCertifications:view'">
                <div class="line"></div>
              </div>
            </div>
            <div
              class="flex"
              v-if="!item.checkSignImg && item.certificationsType === '1'"
              v-auth="'staffCertifications:checkSignature'"
              @click="handleSignature(item, '检查签字')"
            >
              <div>检查签字</div>
            </div>
            <div v-auth="'staffCertifications:checkSignature'" v-if="!item.checkSignImg && item.certificationsType === '1'">
              <div>
                <div class="line"></div>
              </div>
            </div>
            <div
              class="flex"
              v-if="item.checkSignImg != null && !item.confirmSignImg && item.certificationsType === '1'"
              v-auth="'staffCertifications:confirmSignature'"
              @click="handleSignature(item, '确认签字')"
            >
              <div>确认签字</div>
            </div>
            <div
              v-auth="'staffCertifications:confirmSignature'"
              v-if="item.checkSignImg != null && !item.confirmSignImg && item.certificationsType === '1'"
            >
              <div>
                <div class="line"></div>
              </div>
            </div>
            <div class="flex" @click="toDetails(item)">
              <img src="../../../assets/images/certificate/eye.png" width="14" height="14" />
              <div>详情</div>
            </div>
          </div>
        </div>
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
              <a-select v-model:value="orgText" class="custom-input" placeholder="请选择" readonly @click="showPicker = true" />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">车间</div>
            <div class="choose-list">
              <a-select v-model:value="departText" class="custom-input" placeholder="请选择" readonly @click="showDepartPicker = true" />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">证书类型</div>
            <div class="choose-list">
              <div
                class="choose-item"
                @click="chooseClassify(index, item.value)"
                v-for="(item, index) in certificateTypeOptions"
                :key="index"
                :class="{ 'item-margin': (index + 1) % 2 != 0, 'item-active': isActiveClassify && isActiveClassifyIndex == index }"
              >
                {{ item.text }}
                <input type="text" v-model="item.value" style="display: none" />
              </div>
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">操作项目</div>
            <div class="choose-list">
              <a-select v-model:value="workTypeText" class="custom-input" placeholder="请选择" readonly @click="showWorkTypePicker = true" />
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">作业类别</div>
            <div class="choose-list">
              <a-select v-model:value="actionItemsText" class="custom-input" placeholder="请选择" readonly @click="showActionItemsPicker = true" />
            </div>
          </div>
          <div class="content-item" style="position: relative">
            <div class="item-label">人员姓名</div>
            <a-input class="custom-input" v-model:value="queryParam.userRealname" placeholder="请输入" />
          </div>
          <div class="content-item" style="position: relative; margin-bottom: 20px">
            <div class="item-label">到期日期</div>
            <a-input class="custom-input" v-model:value="date" readonly placeholder="请选择" @click="showTime = true" />
            <van-icon name="arrow-down" class="arrow-down" @click="showTime = true" />
          </div>
        </div>
        <div class="action-btn">
          <div class="btn-item-1" @click="handleReset">重置</div>
          <div class="btn-item-2" @click="handleConfirm">查询</div>
        </div>
      </div>
    </van-popup>
    <van-popup v-model:show="showPicker" destroy-on-close round position="bottom">
      <van-picker :columns="orgOptions" @cancel="showPicker = false" @confirm="onOrgConfirm" />
    </van-popup>
    <van-popup v-model:show="showDepartPicker" destroy-on-close round position="bottom">
      <van-picker :columns="departOptions" @cancel="showDepartPicker = false" @confirm="onDepartConfirm" />
    </van-popup>
    <!-- 作业类别开始 -->
    <van-popup v-model:show="showWorkTypePicker" destroy-on-close round position="bottom">
      <van-picker :columns="workTypeOptions" @cancel="showWorkTypePicker = false" @confirm="onWorkTypeConfirm" />
    </van-popup>
    <!-- 作业类别结束 -->
    <!-- 操作项目开始 -->
    <van-popup v-model:show="showActionItemsPicker" destroy-on-close round position="bottom">
      <van-picker :columns="actionItemsOptions" @cancel="showActionItemsPicker = false" @confirm="onActionItemsConfirm" />
    </van-popup>
    <!-- 操作项目结束 -->
    <van-calendar v-model:show="showTime" type="range" :min-date="new Date('2023-01-01')" :allow-same-day="true" @confirm="onConfirm" />
  </div>
</template>
<script lang="ts" setup>
  import { onMounted, reactive, ref } from 'vue';
  import { defHttp } from '/@/utils/http/axios';
  import { initDictOptions } from '/@/utils/dict';
  import { uerList } from './app.api';
  import { getDepart3ListWithSecurity } from '../certificate/certificate.api';
  import dayjs from 'dayjs';
  import { useRouter } from 'vue-router';
  import { showToast } from 'vant';
  const router = useRouter();
  const queryParam: any = reactive({
    organizationCode: undefined,
    departCode: undefined,
    userRealname: '',
    certificationsType: undefined,
    expireStartDate: undefined,
    expireEndDate: undefined,
    workType: undefined,
    actionItems: undefined,
    pageNo: 1,
    pageSize: 10,
  });
  const dataSource: any = ref([]);
  const showRight = ref(false);
  const orgOptions = ref<any>([]);
  const departOptions: any = ref([]);
  const isActiveClassify = ref(false);
  const isActiveClassifyIndex = ref(null);
  const certificateTypeOptions = ref<any>([]);
  // 作业类别开始
  const workTypeOptions = ref<any>([]);
  const workTypeText = ref(undefined);
  const showWorkTypePicker = ref(false);
  // 作业类别结束
  // 操作项目开始
  const actionItemsOptions = ref<any>([]);
  const actionItemsText = ref(undefined);
  const showActionItemsPicker = ref(false);
  // 操作项目结束
  const showTime = ref(false);
  const loading = ref(false);
  const date = ref('');
  const showPicker = ref(false);
  const orgText = ref(undefined);
  const showDepartPicker = ref(false);
  const departText = ref(undefined);
  const finished = ref(false);
  const total = ref(0);
  // 所属机构列表
  const getOrgList = async () => {
    orgOptions.value = [];
    await getDepart3ListWithSecurity().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          text: item.departName,
          value: item.orgCode,
        };
      });
    });
  };
  // 车间列表
  const getDepartList = (orgCode) => {
    departOptions.value = [];
    defHttp.get({ url: '/jn/common/selectDeptNew', params: { orgCode } }).then((res) => {
      departOptions.value = res.map((item: any) => {
        return {
          text: item.departName,
          value: item.orgCode,
        };
      });
      departOptions.value.unshift({
        label: '无',
        value: 'none',
      });
    });
  };
  // 筛选
  const showSearchDrawer = () => {
    showRight.value = true;
  };
  const onOrgConfirm = ({ selectedValues, selectedOptions }) => {
    showPicker.value = false;
    queryParam.organizationCode = selectedValues[0];
    queryParam.departCode = undefined;
    departText.value = undefined;
    departOptions.value = [];
    orgText.value = selectedOptions[0].text;
    getDepartList(selectedValues[0]);
  };
  const onDepartConfirm = ({ selectedValues, selectedOptions }) => {
    showDepartPicker.value = false;
    queryParam.departCode = selectedValues[0];
    departText.value = selectedOptions[0].text;
  };
  // 作业类别
  const onWorkTypeConfirm = async ({ selectedValues, selectedOptions }) => {
    showWorkTypePicker.value = false;
    workTypeText.value = selectedOptions[0].text;
    queryParam.workType = selectedValues[0];
    actionItemsOptions.value = [];
    queryParam.actionItems = undefined;
    actionItemsOptions.value = await initDictOptions(queryParam.workType);
  };
  // 操作项目
  const onActionItemsConfirm = ({ selectedValues, selectedOptions }) => {
    showActionItemsPicker.value = false;
    actionItemsText.value = selectedOptions[0].text;
    queryParam.actionItems = selectedValues[0];
  };
  // 到期时间
  const onConfirm = (values) => {
    const [start, end] = values;
    showTime.value = false;
    date.value = `${dayjs(start).format('YYYY-MM-DD')} - ${dayjs(end).format('YYYY-MM-DD')}`;
    queryParam.expireStartDate = `${dayjs(start).format('YYYY-MM-DD')} 00:00:00`;
    queryParam.expireEndDate = `${dayjs(end).format('YYYY-MM-DD')} 23:59:59`;
  };
  // 证书类型
  const chooseClassify = (index, value) => {
    if (isActiveClassifyIndex.value == index) {
      isActiveClassify.value = !isActiveClassify.value;
      queryParam.certificationsType = undefined;
    } else {
      isActiveClassifyIndex.value = index;
      isActiveClassify.value = true;
      queryParam.certificationsType = value;
    }
  };
  // 筛选-确认
  const handleConfirm = () => {
    queryParam.pageNo = 1;
    loadData();
    showRight.value = false;
  };

  // 重置
  function handleReset() {
    queryParam.pageNo = 1;
    isActiveClassify.value = false;
    isActiveClassifyIndex.value = null;
    queryParam.organizationCode = undefined;
    queryParam.departCode = undefined;
    queryParam.certificationsType = undefined;
    queryParam.workType = undefined;
    queryParam.actionItems = undefined;
    queryParam.userRealname = '';
    queryParam.expireStartDate = undefined;
    queryParam.expireEndDate = undefined;
    date.value = '';
    departOptions.value = [];
    actionItemsOptions.value = [];
    workTypeText.value = undefined;
    actionItemsText.value = undefined;
    orgText.value = undefined;
    departText.value = undefined;
    loadData();
  }
  // 复审
  const recheck = (item) => {
    router.push({
      path: '/app/certificate/recheck',
      query: {
        id: item.id,
      },
    });
  };
  // 详情
  const toDetails = (item) => {
    router.push({
      path: '/app/certificate/details',
      query: {
        obj: JSON.stringify(item),
      },
    });
  };
  const handleSignature = (item, title) => {
    if (!item.filePath || item.filePath === '') {
      return showToast('请完善必填信息再签字！');
    }
    router.push({
      path: '/app/certificate/signature',
      query: {
        obj: JSON.stringify(item),
        title,
      },
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
  const loadData = async (is = true) => {
    loading.value = true;
    finished.value = true;
    if (orgOptions.value.length === 1) {
      orgText.value = orgOptions.value[0].text;
      queryParam.organizationCode = orgOptions.value[0].value;
      getDepartList(orgOptions.value[0].value);
    }
    await uerList(queryParam)
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
  const initDictConfig = async () => {
    certificateTypeOptions.value = await initDictOptions('pq_certificate_type');
    workTypeOptions.value = await initDictOptions('person_list_work_type');
  };
  const clearSearch = () => {
    queryParam.userRealname = '';
    loadData();
  };
  onMounted(async () => {
    await getOrgList();
    initDictConfig();
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
      background-color: #ffffff;
      background-image: url('../../../assets/images/certificate/bg.png');
      background-size: cover;
      margin: 0 14px;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 8px;
      .top {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        .right {
          width: calc(100% - 48px);
          padding-left: 8px;
          font-size: 12px;
          color: rgba(0, 0, 0, 0.87);
          .number {
            color: #84878b;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .name {
            font-size: 15px;
            margin-top: 8px;
            margin-bottom: 4px;
          }
        }
      }
      .bottom {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        font-size: 12px;
        margin-top: 12px;
        color: #84878b;
        span {
          color: rgba(0, 0, 0, 0.87);
        }
        .three {
          display: flex;
          align-items: center;
          img {
            width: 14px;
            height: 14px;
          }
          .line {
            width: 1px;
            height: 15px;
            background: rgba(0, 0, 0, 0.15);
            margin: 0 5px;
          }
          .flex {
            display: flex;
            align-items: center;
          }
        }
      }
      .list_item {
        font-size: 14px;
        line-height: 30px;
        span {
          color: #888888;
        }
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
  :deep(.van-popup--right) {
    overflow-y: hidden;
    height: 100%;
    .content-box {
      height: calc(100% - 104px);
      overflow-y: auto;
    }
  }
</style>
