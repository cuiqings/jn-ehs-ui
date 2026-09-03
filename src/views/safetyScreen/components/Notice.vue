<script lang="ts" setup>
  import { ref } from 'vue';
  import { getNoticeApi } from '../plan.api';
  import { useDrawer } from '../../notice/components/Drawer';
  import EhsNoticeInfoPreview from '../../notice/noticeSign/components/EhsNoticeInfoPreview.vue';
  import EhsNoticeInfoDetail from '../../notice/noticeRectification/components/EhsNoticeInfoDetail.vue';
  const [registerDesc, { openDrawer: openDesc }] = useDrawer();
  const [registerRectification, { openDrawer: openRectification }] = useDrawer();

  const noticeData: any = ref([]);

  function getNoticeList(val) {
    const params = {
      code: 'A04B01A01',
      startTime: val.startTime,
      endTime: val.endTime,
      orgCode: val.orgCode || 'A04',
    };
    getNoticeApi(params).then((res) => {
      if (res) {
        noticeData.value = res;
      } else noticeData.value = [];
    });
  }

  function fmtStatus(val) {
    const obj = {
      '2': '待签收',
      '3': '整改中',
      '4': '待复查',
      '5': '已完成',
    };
    return obj[val];
  }

  function goDetail(record) {
    if (record.status === '2') {
      openDesc(true, {
        record,
        showFooter: false,
      });
    } else {
      openRectification(true, {
        record,
        showFooter: false,
        titleCode: '5',
      });
    }
  }

  defineExpose({
    getNoticeList,
  });
</script>

<template>
  <div class="notice">
    <div class="card-title">
      <div class="title">整改通知单</div>
    </div>
    <div class="d-notice">
      <div class="scroll-container">
        <div class="d-container">
          <div class="d" v-for="(item, index) in noticeData" :key="index">
            <p class="text-status">{{ fmtStatus(item.status) }}</p>
            <p class="text-number" @click="goDetail(item)">{{ item.noticeNo }}</p>
            <p class="text-name" :title="item.receiveOrgName + (item.receiveUserName ? ' - ' + item.receiveUserName : item.receiveUserName)">
              {{ item.receiveOrgName }} {{ item.receiveUserName ? ' - ' + item.receiveUserName : item.receiveUserName }}
            </p>
            <p class="text-deadline">整改期限：{{ item.endDt }}</p>
          </div>
          <div v-if="!noticeData.length" style="padding-top: 10px; flex: 1">
            <a-empty />
          </div>
        </div>
      </div>
    </div>
    <EhsNoticeInfoPreview @register="registerDesc" />
    <EhsNoticeInfoDetail @register="registerRectification" />
  </div>
</template>

<style scoped lang="less">
  .notice {
    width: 400px;
    height: 211px;
    .card-title {
      display: flex;
      height: 40px;
      background: url('../../../assets/images/protection/reform.png') no-repeat;
      position: relative;
      .title {
        font-size: 18px;
        text-align: left;
        font-weight: bold;
        color: #f4fffe;
        margin-left: 58px;
        line-height: 38px;
        /* font-family:PangMenZhengDao-Regular; */
      }
      .state {
        font-size: 14px;
        text-align: right;
        color: #cfd3d8;
        line-height: 40px;
        margin-left: 154px;
      }
    }
    .d-notice {
      width: 393px;
      height: 173px;
      margin-top: 12px;
      .scroll-container {
        max-height: 159px; /* 最大高度为173px */
        overflow-y: auto; /* 创建垂直滚动容器 */
      }
      .d-container {
        display: flex; /* 水平排列子元素 */
        flex-wrap: wrap; /* 换行显示 */
        justify-content: space-between; /* 每行两个元素，均匀分布 */
        width: 100%; /* 容器宽度占满 */
      }
      .d {
        //display: flex; /* 水平排列子元素 */
        position: relative;
        text-align: center;
        width: 186px;
        height: 159px;
        margin-bottom: 7px; /* 添加垂直间距 */
        margin-right: 7px;
        background: url('../../../assets/images/controlScreen/zhenggai.png') no-repeat left;
        background-size: cover;
        overflow: hidden;
        .text-status {
          position: absolute;
          text-align: center;
          top: 5px;
          left: 19px;
          height: 21px;
          font-size: 12px;
          color: #ff8251;
          font-family: Alibaba PuHuiTi-Regular, Alibaba PuHuiTi;
        }
        .text-number {
          position: absolute;
          text-decoration: underline;
          text-align: center;
          width: 186px;
          top: 78px;
          font-size: 18px;
          color: #2feaf8;
          font-weight: 500;
          font-family: Alibaba PuHuiTi-Medium, Alibaba PuHuiTi;
          cursor: pointer;
        }
        .text-name {
          position: absolute;
          text-align: center;
          width: 186px;
          top: 105px;
          font-size: 14px;
          font-family: Alibaba PuHuiTi-Regular, Alibaba PuHuiTi;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .text-deadline {
          position: absolute;
          text-align: center;
          width: 186px;
          top: 130px;
          font-size: 14px;
          font-family: Alibaba PuHuiTi-Regular, Alibaba PuHuiTi;
        }
      }
    }
  }
</style>
