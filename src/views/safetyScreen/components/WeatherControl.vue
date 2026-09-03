<script setup lang="ts">
  import { ref } from 'vue';
  import { render } from '/@/utils/common/renderUtils';
  import { getWeatherApi } from '../plan.api';
  import { useDrawer } from '../../notice/components/Drawer';
  import EhsNoticeInfoPreview from '../../notice/noticeSign/components/EhsNoticeInfoPreview.vue';
  import EhsNoticeInfoDetail from '../../notice/noticeRectification/components/EhsNoticeInfoDetail.vue';
  const [registerDesc, { openDrawer: openDesc }] = useDrawer();
  const [registerRectification, { openDrawer: openRectification }] = useDrawer();
  const weatherData: any = ref([]);

  function getWeatherList(_val) {
    getWeatherApi().then((res) => {
      if (res.records) {
        weatherData.value = res.records.length > 2 ? res.records.slice(0, 2) : res.records;
      } else {
        weatherData.value = [];
      }
    });
  }

  const goDetail = (record) => {
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
  };

  defineExpose({
    getWeatherList,
  });
</script>

<template>
  <div class="WeatherControl">
    <div class="card-title">
      <div class="title">污染天气管控</div>
    </div>
    <div class="work-card">
      <div class="scroll-container">
        <div class="card" v-for="(item, index) in weatherData" :key="index" @click="goDetail(item)">
          <div class="card-style1">
            <div class="font2">{{ item.title }}{{ render.renderDictText(item.type, 'notice_info_type') }}</div>
          </div>
          <div class="card-style2">
            <div class="font5" :title="item.noticeContent">
              管控内容：<span style="color: #fff">{{ item.noticeContent }}</span>
            </div>
          </div>
          <div class="card-style2">
            <div class="font5">
              管控时间：<span style="color: #fff"
                >{{ item.controlStartDt && item.controlEndDt ? item.controlStartDt + ' 至 ' : item.controlStartDt }}{{ item.controlEndDt }}</span
              >
            </div>
          </div>
        </div>
        <div v-if="!weatherData.length" style="padding-top: 30px">
          <a-empty />
        </div>
      </div>
    </div>
    <EhsNoticeInfoPreview @register="registerDesc" />
    <EhsNoticeInfoDetail @register="registerRectification" />
  </div>
</template>

<style scoped>
  .WeatherControl {
    display: flex;
    flex-direction: column;
    height: 270px;
    width: 392px;
    .card-title {
      display: flex;
      height: 40px;
      background: url('../../../assets/images/controlScreen/highrisk.png') no-repeat;
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
        .pre-button {
          cursor: pointer;
        }
        .next-button {
          cursor: pointer;
        }
      }
    }
    .work-card {
      height: 205px;
      margin-top: 15px;
      .scroll-container {
        max-height: 205px; /* 最大高度为280px */
        /* overflow-y: auto;  */
      }
      .card {
        width: 380px;
        height: 106px;
        padding: 5px 10px 10px 10px;
        position: relative;
        background: url('../../../assets/images/controlScreen/workcd.png') no-repeat;
        .font1 {
          font-size: 18px;
          font-weight: bold;
          color: #dadbde;
        }
        .card-style1 {
          .font2 {
            font-size: 14px;
            font-weight: bold;
            color: #2feaf8;
            text-decoration: underline;
            cursor: pointer;
          }
        }
        .card-style2 {
          .font5 {
            font-size: 13px;
            color: #cfd3d8;
            word-break: break-all;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
    }
  }
</style>
