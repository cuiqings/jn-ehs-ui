<template>
  <div class="selfStudyDetail">
    <div class="hd">
      <a-button :icon="h(ArrowLeftOutlined)" @click="router.back()" type="primary" ghost>返回</a-button>
      <div class="search">
        时间：<a-range-picker v-model:value="time" @change="onChangeTime" format="YYYY-MM-DD" valueFormat="YYYY-MM-DD" />
        <a-button type="primary" @click="pageInit">查询</a-button>
        <a-button>重置</a-button>
      </div>
    </div>
    <div class="main">
      <a-collapse v-model:activeKey="activeKey">
        <a-collapse-panel v-for="(item, idx) in list" :key="idx+1" :header="item.date">
          <div class="static-info">
            今日已完成每日一练，学分+{{ item.statistics.dayCredits }}； 已学习视频{{ item.statistics.videoCount }}个， 学习时长{{
                computeTime(item.statistics.videoCount)
              }}，学分+{{ item.statistics.videoCredits }}； 已学习文档{{ item.statistics.docCount }}个，学习时长{{
                computeTime(item.statistics.videoCount) }}，学分+{{
                item.statistics.docCredits
              }}； 刷题{{ item.statistics.practiseCount }}个，刷题时长{{ computeTime(item.statistics.practiseDuration) }}，学分+{{
                item.statistics.practiseCredits }}，
              总学分{{ item.statistics.totalCredits }}。
          </div>
          <div class="item" v-if="item.dayList.length > 0">
            <div class="title">每日一练</div>
            <a-table :columns="columns" :pagination="false" :data-source="item.dayList">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'progress'">
                  <span>{{ record.name }}</span>
                  <a-button type="link" @click="getStudyDetail(record)">明细</a-button>
                </template>
                <template v-if="column.key === 'duration'">
                  {{ computeTime(record.duration) }}
                </template>
              </template>
            </a-table>
          </div>
          <div class="item" v-if="item.videoList.length > 0">
            <div class="title">视频学习</div>
            <a-table :columns="columns" :pagination="false" :data-source="item.videoList">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <span>{{ record.name }}</span>
                </template>
                <template v-if="column.key === 'duration'">
                  {{ computeTime(record.duration) }}
                </template>
              </template>
            </a-table>
          </div>
          <div class="item" v-if="item.docList.length > 0">
            <div class="title">文档学习</div>
            <a-table :columns="columns" :pagination="false" :data-source="item.docList">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                  <span>{{ record.name }}</span>
                </template>
                <template v-if="column.key === 'duration'">
                  {{ computeTime(record.duration) }}
                </template>
              </template>
            </a-table>
          </div>
          <div class="item" v-if="item.quizList.length > 0">
            <div class="title">自由答题</div>
            <a-table :columns="columns" :pagination="false" :data-source="item.quizList">
              <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'progress'">
                  <span>{{ record.name }}</span>
                  <a-button type="link" @click="getStudyDetail(record)">明细</a-button>
                </template>
                <template v-if="column.key === 'duration'">
                  {{ computeTime(record.duration) }}
                </template>
              </template>
            </a-table>
          </div>
        </a-collapse-panel>
      </a-collapse>
    </div>
    <ExamRecord @register="registerRecord" />
  </div>
</template>

<script setup lang="ts">
  import ExamRecord from './components/examRecord.vue';
  import { h, ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { getDetail } from './url/index';
  import { ArrowLeftOutlined } from '@ant-design/icons-vue';
  import { useModal } from '/@/components/Modal';
  import dayjs from 'dayjs';
  import type { Dayjs } from 'dayjs';
  const router = useRouter();
  // 默认最近一周
  type RangeValue = [Dayjs, Dayjs];
  const time = ref<RangeValue>([dayjs().subtract(6, 'days'), dayjs()]);
  const queryParam = ref<any>({});
  queryParam.value['startTime'] = time.value[0].format('YYYY-MM-DD');
  queryParam.value['endTime'] = time.value[1].format('YYYY-MM-DD');
  const activeKey = ref<string[]>(['1']);
  const columns = ref<any[]>([
    {
      title: '课时',
      key: 'name',
      dataIndex: 'name',
      width: '50%',
    },
    {
      title: '学习进度',
      key: 'progress',
      dataIndex: 'progress',
      width: '30%',
    },
    {
      title: '学习时长',
      key: 'duration',
      dataIndex: 'duration',
      width: '10%',
    },
    {
      title: '增加学分',
      key: 'credits',
      dataIndex: 'credits',
      width: '10%',
    },
  ]);
  // 考试记录弹框
  const [registerRecord, { openModal: openModalRecord }] = useModal();

  function onChangeTime(date, dateString) {
    queryParam.value['startTime'] = dateString[0];
    queryParam.value['endTime'] = dateString[1];
  }
  const list = ref<any[]>([]);
  const getStudyDetail = (record) => {
    openModalRecord(true, record);
  };
  const pageInit = () => {
    getDetail(queryParam.value).then((res) => {
      list.value = res;
    });
  };
  onMounted(() => {
    pageInit();
  });
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
    height: calc(100vh - 87px);
    padding: 10px;
    background-color: #fff;
    .hd {
      padding: 10px;
      display: flex;
      align-items: center;
      .search {
        display: flex;
        align-items: center;
        margin-left: 20px;
        button {
          margin-left: 10px;
        }
      }
    }
    .main {
      padding: 10px;
      background-color: #fff;
      .static-info {
        font-size: 14px;
        font-weight: 600;
        padding: 10px;
        background-color: #fff;
        border-bottom: 1px solid #f0f0f0;
      }
    }
  }
</style>
