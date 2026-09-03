<template>
  <div class="appExamineQuestion">
    <div class="search-right" @click="showSearchDrawer">
      <span class="btn-text">筛选</span>
      <img class="btn-icon" :src="down" />
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
            <p @click="goDetails(item.id)" class="clamp">{{ item.description }}</p>
            <div @click="goDetails(item.id)" style="color: rgb(127, 127, 127); margin-bottom: 3px"> 检查部位：{{ item.checkSite }} </div>
            <div>
              <div v-if="item.image">
                <img
                  :src="getFileAccessHttpUrl(item.image.split(',')[0])"
                  style="cursor: pointer; display: inline-block; width: 80px; height: 60px"
                  @click="openImg(item)"
                />
                <img
                  v-if="item.image && item.image.split(',').length > 1"
                  :src="getFileAccessHttpUrl(item.image.split(',')[1])"
                  style="cursor: pointer; display: inline-block; width: 80px; height: 60px; margin-left: 20px"
                  @click="openImg(item)"
                />
              </div>
              <div @click="goDetails(item.id)" v-if="!item.image">检查日期：{{ item.checkTime.slice(0, 10) }}</div>
              <van-button v-auth="'examineQuestion:confirm'" v-if="item.status === '0'" type="primary" @click="onPrimary(item, 'confirm')"
                >问题确认</van-button
              >
              <van-button
                v-auth="'examineQuestion:rectify'"
                v-if="(item.status === '2' || item.status === '3') && item.dutyPersonId === userInfo.userInfo.id"
                type="primary"
                @click="onPrimary(item, 'rectify')"
                >问题整改</van-button
              >
              <van-button v-auth="'examineQuestion:review'" v-if="item.status === '4'" type="primary" @click="onPrimary(item, 'review')"
                >问题复查</van-button
              >
            </div>
            <div @click="goDetails(item.id)" v-if="item.image" style="margin-top: 3px">检查日期：{{ item.checkTime.slice(0, 10) }}</div>
          </div>
        </div>
      </van-list>
      <a-empty v-if="listArr.length === 0" style="margin-top: 50%" />
    </div>
    <van-popup v-model:show="showRight" closeable position="right" :style="{ width: '294px', height: '100%' }">
      <div>
        <div class="search-title">筛选</div>
        <div class="search-split"></div>
        <div class="content-box">
          <div class="content-item">
            <div class="item-label">所属机构</div>
            <div class="orgOptions-value">
              <div
                v-for="item in orgOptions"
                :key="item.id"
                @click="onOrgOptions(item)"
                :class="queryForm.subsidiaryCode === item.value ? 'active' : ''"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <div class="content-item">
            <div class="item-label">检查日期</div>
            <a-range-picker
              :getPopupContainer="getPopupContainer"
              style="width: 100%"
              valueFormat="YYYY-MM-DD"
              v-model:value="executeDate"
              @change="onDate"
            />
          </div>
          <div class="content-item">
            <div class="item-label">问题描述</div>
            <a-input v-model:value="queryForm.description" placeholder="请输入" />
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
<script setup name="app-examineQuestion-list" lang="ts">
  import { getPopupContainer } from '/@/utils';
  import down from '/@/assets/images/emergency/down.png';
  import { getFileAccessHttpUrl } from '/@/utils/common/compUtils';
  import { createImgPreview } from '/@/components/Preview/index';
  import { list, getOrganizationNew } from '../url/index';
  import { ref, onMounted, reactive } from 'vue';
  import { useRouter } from 'vue-router';
  import { getLoginBackInfo } from '/@/utils/auth';
  const router = useRouter();
  const userInfo: any = getLoginBackInfo();
  const showRight = ref(false);
  const loading = ref(false);
  const finished = ref(false);
  const total = ref(0);
  const executeDate = ref([]);
  const orgOptions: any = ref([]);
  const queryForm = reactive({
    pageNo: 1,
    pageSize: 10,
    description: '',
    startTime: '',
    endTime: '',
    subsidiaryCode: '',
  });
  const listArr = ref<any[]>([]);
  onMounted(() => {
    init();
    getOrganizationNew().then((res) => {
      orgOptions.value = res.map((item) => {
        return {
          label: item.departName,
          value: item.orgCode,
          id: item.id,
        };
      });
      if (orgOptions.value.length === 1) {
        queryForm.subsidiaryCode = orgOptions.value[0].value;
      }
    });
  });
  const init = async (is = true) => {
    loading.value = true;
    list(queryForm)
      .then((res) => {
        total.value = res.total;
        if (is) listArr.value = res.records;
        else listArr.value = listArr.value.concat(res.records);
      })
      .finally(() => {
        loading.value = false;
        finished.value = false;
      });
  };
  const showSearchDrawer = () => {
    showRight.value = true;
  };
  const handleReset = () => {
    queryForm.description = '';
    queryForm.startTime = '';
    queryForm.endTime = '';
    executeDate.value = [];
    if (orgOptions.value.length === 1) {
      queryForm.subsidiaryCode = orgOptions.value[0].value;
    } else {
      queryForm.subsidiaryCode = '';
    }
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
  const onPrimary = (data, type) => {
    router.push({
      path: `/app/examineQuestion/${type}`,
      query: {
        data: JSON.stringify(data),
      },
    });
  };
  const goDetails = (id) => {
    router.push({
      path: '/app/examineQuestion/details',
      query: {
        id,
      },
    });
  };
  const openImg = (record) => {
    const imageList = record.image.split(',').map((i) => getFileAccessHttpUrl(i));
    createImgPreview({
      imageList: imageList,
      defaultWidth: 350,
      rememberState: true,
      scaleStep: 10,
    });
  };
  const onDate = (value) => {
    if (value && value.length > 0) {
      queryForm.startTime = value[0];
      queryForm.endTime = value[1];
    } else {
      queryForm.startTime = '';
      queryForm.endTime = '';
      executeDate.value = [];
    }
  };
  const onOrgOptions = (item) => {
    queryForm.subsidiaryCode = item.value;
  };
</script>
<style lang="less" scoped>
  .appExamineQuestion {
    background: #eff1f5;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .search-right {
      float: right;
      width: 74px;
      height: 40px;
      border-radius: 20px 20px 20px 20px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      margin: 10px 12px;
      text-align: center;
      line-height: 40px;
      .btn-text {
        font-size: 13px;
        font-family: PingFang SC-Regular, PingFang SC;
        font-weight: 400;
        color: rgba(0, 0, 0, 0.87);
        vertical-align: middle;
        display: inline-block;
        margin-bottom: 3px;
      }
      .btn-icon {
        display: inline-block;
        width: 10px;
        height: 10px;
        margin-left: 4px;
        vertical-align: middle;
        margin-bottom: 3px;
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
      .clamp {
        word-break: break-all;
        overflow: hidden;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
      }
      & > div:nth-child(1) {
        width: 100%;
        & > p {
          margin: 0;
          font-size: 16px;
          font-weight: bold;
        }
        & > div:nth-child(3) {
          display: flex;
          justify-content: space-between;
          align-items: center;
          button {
            height: 36px;
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
        .ant-picker-range {
          width: 100%;
          height: 46px;
          border-radius: 4px 4px 4px 4px;
          margin-top: 8px;
        }
        .ant-input {
          width: 100%;
          height: 46px;
          border-radius: 4px 4px 4px 4px;
          margin-top: 8px;
        }
        .orgOptions-value {
          & > div {
            width: calc((100% - 30px) / 2);
            display: inline-block;
            height: 40px;
            line-height: 40px;
            margin-top: 8px;
            background: rgb(242, 242, 242);
            text-align: center;
            border-radius: 5px;
          }
          & > div:nth-child(2n) {
            margin-left: 30px;
          }
          .active {
            background: rgb(24, 144, 255);
            color: #ffffff;
          }
        }
      }
    }
  }
</style>
