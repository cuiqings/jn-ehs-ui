<template>
  <div class="selfStudyDetail">
    <div class="title">
      每日一练明细
      <span v-if="dateRangeText" @click="showDatePicker = true" class="date-range"><span>时间：{{ dateRangeText
          }}</span></span>
      <span v-else @click="showDatePicker = true" class="date-range">
        <span>时间：<i>请选择</i></span>
      </span>
    </div>
    <van-calendar :min-date="minDate" :max-date="maxDate" allow-same-day type="range" v-model:show="showDatePicker"
      @confirm="onDateConfirm" />
    <div class="main">
      <van-collapse v-model="activeNames">
        <van-collapse-item v-for="(item, idx) in list" :key="idx" :title="item.date" :name="item.date">
          <div class="static-info">
            <!-- {{ item.statistics }} -->
            <div>
              今日已完成每日一练，学分+{{ item.statistics.dayCredits }}； 已学习视频{{ item.statistics.videoCount }}个， 学习时长{{
                computeTime(item.statistics.videoDuration)
              }}，学分+{{ item.statistics.videoCredits }}； 已学习文档{{ item.statistics.docCount }}个，学习时长{{
                computeTime(item.statistics.docDuration) }}，学分+{{
                item.statistics.docCredits
              }}； 刷题{{ item.statistics.practiseCount }}个，刷题时长{{ computeTime(item.statistics.practiseDuration) }}，学分+{{
                item.statistics.practiseCredits }}，
              总学分{{ item.statistics.totalCredits }}。
            </div>
          </div>
          <div class="title">每日一练</div>
          <div class="item" v-for="citem in item.dayList" :key="citem.id">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ citem.name }}
            </div>
            <div class="info" style="margin-bottom: 5px">
              <div class="status">{{ citem.progress }}</div>
              <span>学习时长：{{ computeTime(citem.duration) }}</span>
            </div>
            <div class="info">
              <div class="status">增加学分：{{ citem.credits }}</div>
              <van-button plain v-if="citem.progress" type="primary" @click.stop="showExamRecord(citem)">明细</van-button>
            </div>
          </div>
          <div class="title">视频学习</div>
          <div class="item" v-for="citem in item.videoList" :key="citem.id">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ citem.name }}
            </div>
            <div class="info" style="margin-bottom: 5px">
              <div class="status">{{ citem.progress }}</div>
              <span>学习时长：{{ computeTime(citem.duration) }}</span>
            </div>
            <div class="info">
              <div class="status">增加学分：{{ citem.credits }}</div>
            </div>
          </div>
          <div class="title">文档学习</div>
          <div class="item" v-for="citem in item.docList" :key="citem.id">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ citem.name }}
            </div>
            <div class="info" style="margin-bottom: 5px">
              <div class="status">{{ citem.progress }}</div>
              <span>学习时长：{{ computeTime(citem.duration) }}</span>
            </div>
            <div class="info">
              <div class="status">增加学分：{{ citem.credits }}</div>
            </div>
          </div>
          <div class="title">自由答题</div>
          <div class="item" v-for="citem in item.quizList" :key="citem.id">
            <div class="tit"><van-icon name="todo-list-o" style="font-size: 22px; color: #1989fa" />{{ citem.name }}
            </div>
            <div class="info" style="margin-bottom: 5px">
              <div class="status">{{ citem.progress }}</div>
              <span>学习时长：{{ computeTime(citem.duration) }}</span>
            </div>
            <div class="info">
              <div class="status">增加学分：{{ citem.credits }}</div>
              <van-button plain v-if="citem.progress" type="primary" @click.stop="showExamRecord(citem)">明细</van-button>
            </div>
          </div>
        </van-collapse-item>
      </van-collapse>
    </div>
    <ExamRecord ref="examRecordRef" v-if="showRecord" :practiseId="practiseId" v-model:show="showRecord" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getDetail } from '/@/views/education/student/selfStudy/url/index';
import ExamRecord from './emamRecord.vue';
const showDatePicker = ref(false);
const dateRangeText = ref('');
const minDate = new Date(2023, 0, 1);
const maxDate = new Date(2060, 12, 31);
import dayjs from 'dayjs';
const activeNames = ref([0]);
const onDateConfirm = (val) => {
  showDatePicker.value = false;
  if (val && val.length === 2) {
    const [start, end] = val;
    queryParam.value['startTime'] = dayjs(start).format('YYYY-MM-DD');
    queryParam.value['endTime'] = dayjs(end).format('YYYY-MM-DD');
    dateRangeText.value = `${dayjs(start).format('YYYY-MM-DD')} 至 ${dayjs(end).format('YYYY-MM-DD')}`;
    pageInit();
  }
};

const queryParam = ref<any>({
  startTime: '',
  endTime: '',
});
// 默认最近一周
queryParam.value['startTime'] = dayjs().subtract(6, 'days').format('YYYY-MM-DD');
queryParam.value['endTime'] = dayjs().format('YYYY-MM-DD');
dateRangeText.value = `${queryParam.value['startTime']} 至 ${queryParam.value['endTime']}`;
const list = ref<any[]>([]);
pageInit();
function pageInit() {
  getDetail(queryParam.value).then((res) => {
    list.value = res;
  });
}
const showRecord = ref(false);
const practiseId = ref('');
const showExamRecord = (item) => {
    showRecord.value = true;
    practiseId.value = item.practiseId;
  };
const computeTime = (time: number) => {
  if(!time) return '';
  let day = Math.floor(time / 3600 / 24);
  let hour = Math.floor((time / 3600) % 24);
  let minute = Math.floor((time / 60) % 60);
  let second = Math.floor(time % 60);
  return day ? `${day}天${hour}时${minute}分${second}秒` : hour ? `${hour}时${minute}分${second}秒` : `${minute}分${second}秒`;
};
</script>

<style scoped lang="less">
.selfStudyDetail {
  height: 100%;
  width: 100%;
  background-color: #fff;

  .title {
    font-size: 14px;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;

    span {
      font-weight: 400;
      display: flex;
      align-items: center;
    }

    .date-range {
      position: relative;
      min-width: 180px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      i {
        color: #999;
        font-style: normal;
        font-size: 13px;
      }

      &::after {
        content: '';
        display: inline-block;
        width: 0px;
        height: 0px;
        border-left: 6px solid transparent;
        border-right: 6px solid transparent;
        border-top: 6px solid #666;
        margin-left: 4px;
      }
    }
  }

  .main {
    height: calc(100vh - 42px);
    background-color: #fff;
    overflow-y: auto;

    .static-info {
      font-size: 13px;
      font-weight: 600;
      background-color: #fff;
      margin-bottom: 10px;
      color: #333;
    }

    .item {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 10px;
      margin-bottom: 10px;

      .tit {
        color: #333;
        font-size: 14px;
        font-weight: 600;
        line-height: 22px;
        margin-bottom: 10px;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;

        i {
          margin-right: 5px;
          transform: translateY(3px);
        }
      }

      .info {
        color: #333333;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
      }
    }
  }
}
</style>
